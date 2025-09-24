<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\CepService;

/**
 * Visits Controller
 *
 * @property \App\Model\Table\VisitsTable $Visits
 */
class VisitsController extends AppController
{
    private CepService $cepService;

    public function initialize(): void
    {
        parent::initialize();
        $this->cepService = new CepService();
    }

    /**
     * Index method - listar visitas com filtro obrigatório por data
     */
    public function index()
    {
        $this->request->allowMethod(['get']);
        $date = $this->request->getQuery('date');

        if (empty($date)) {
            return $this->jsonError('Parâmetro date é obrigatório', 'MISSING_DATE_PARAMETER', 400);
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return $this->jsonError('Data deve estar no formato YYYY-MM-DD', 'INVALID_DATE_FORMAT', 400);
        }

        $visits = $this->Visits->find()
            ->contain(['Addresses'])
            ->where(['Visits.date' => $date])
            ->orderBy(['Visits.created' => 'ASC'])
            ->toArray();

        return $this->jsonResponse([
            'success' => true,
            'data' => $visits,
            'count' => count($visits)
        ]);
    }

    /**
     * Add method - criar nova visita
     */
    public function add()
    {
        $this->request->allowMethod(['post']);
        $data = $this->request->getData();

        // Campos obrigatórios
        foreach (['date', 'forms', 'products', 'address'] as $field) {
            if (empty($data[$field])) {
                return $this->jsonError("Campo {$field} é obrigatório", 'MISSING_REQUIRED_FIELD', 400);
            }
        }
        if (!isset($data['completed'])) {
            $data['completed'] = false;
        }


        $postalCode = $data['address']['postal_code'] ?? null;
        if (!$postalCode) {
            return $this->jsonError('CEP não informado', 'MISSING_POSTAL_CODE', 400);
        }

        $postalCodeClean = $this->cepService->cleanPostalCode($postalCode);

        if (!$this->cepService->isValidFormat($postalCodeClean)) {
            return $this->jsonError('CEP inválido', 'INVALID_POSTAL_CODE', 400);
        }

        $cepData = $this->cepService->lookup($postalCodeClean);
        if (!$cepData || empty($cepData['street'])) {
            return $this->jsonError('CEP não encontrado', 'POSTAL_CODE_NOT_FOUND', 404);
        }


        $addressData = $data['address'];
        foreach (['sublocality', 'street', 'city', 'state'] as $field) {
            if (empty($addressData[$field]) && !empty($cepData[$field])) {
                $addressData[$field] = $cepData[$field];
            }
        }

        $connection = $this->Visits->getConnection();
        $connection->begin();

        try {
            $addressesTable = $this->fetchTable('Addresses');
            $address = $addressesTable->newEntity($addressData);

            if (!$addressesTable->save($address)) {
                $connection->rollback();
                return $this->jsonError('Erro ao salvar endereço', 'ADDRESS_SAVE_ERROR', 400, $address->getErrors());
            }

            $visit = $this->Visits->newEntity([
                'date' => $data['date'],
                'forms' => (int)$data['forms'],
                'products' => (int)$data['products'],
                'completed' => $data['completed'] ?? false,
                'address_id' => $address->id
            ]);

            if (!$this->Visits->save($visit)) {
                $connection->rollback();
                return $this->jsonError('Erro ao salvar visita', 'VISIT_SAVE_ERROR', 400, $visit->getErrors());
            }

            $connection->commit();

            // Recarregar com endereço
            $visit = $this->Visits->get($visit->id, ['contain' => ['Addresses']]);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Visita criada com sucesso',
                'data' => $visit
            ], 201);
        } catch (\Exception $e) {
            $connection->rollback();
            return $this->jsonError('Erro interno do servidor', 'INTERNAL_SERVER_ERROR', 500, ['exception' => $e->getMessage()]);
        }
    }

    // -----------------------
    // Helper methods JSON
    // -----------------------
    private function jsonResponse(array $data, int $status = 200)
    {
        return $this->response
            ->withType('application/json')
            ->withStringBody(json_encode($data))
            ->withStatus($status);
    }

    private function jsonError(string $message, string $errorCode, int $status = 400, array $errors = [])
    {
        $response = [
            'success' => false,
            'message' => $message,
            'error' => $errorCode
        ];
        if ($errors) {
            $response['errors'] = $errors;
        }

        return $this->jsonResponse($response, $status);
    }
}
