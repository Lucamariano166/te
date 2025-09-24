<?php
declare(strict_types=1);

namespace App\Controller;

/**
 * Visits Controller
 *
 * @property \App\Model\Table\VisitsTable $Visits
 */
class VisitsController extends AppController
{
    /**
     * Inicialização do controller
     *
     * @return void
     */
    public function initialize(): void
    {
        parent::initialize();
        // RequestHandler component não é mais necessário no CakePHP 5.x
        // $this->loadComponent('RequestHandler');
    }

    /**
     * Index method - listar visitas com filtro obrigatório por data
     *
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function index()
    {
        $this->request->allowMethod(['get']);

        $date = $this->request->getQuery('date');

        if (empty($date)) {
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Parâmetro date é obrigatório',
                    'error' => 'MISSING_DATE_PARAMETER'
                ]))
                ->withStatus(400);
        }

        // Validar formato da data
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Data deve estar no formato YYYY-MM-DD',
                    'error' => 'INVALID_DATE_FORMAT'
                ]))
                ->withStatus(400);
        }

        $visits = $this->Visits->find()
            ->contain(['Addresses'])
            ->where(['Visits.date' => $date])
            ->orderBy(['Visits.created' => 'ASC'])
            ->toArray();

        return $this->response
            ->withType('application/json')
            ->withStringBody(json_encode([
                'success' => true,
                'data' => $visits,
                'count' => count($visits)
            ]));
    }

    /**
     * Add method - criar nova visita
     *
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function add()
    {
        $this->request->allowMethod(['post']);

        $data = $this->request->getData();

        // Validar campos obrigatórios
        $requiredFields = ['date', 'forms', 'products', 'address'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->response
                    ->withType('application/json')
                    ->withStringBody(json_encode([
                        'success' => false,
                        'message' => "Campo {$field} é obrigatório",
                        'error' => 'MISSING_REQUIRED_FIELD'
                    ]))
                    ->withStatus(400);
            }
        }

        // Validar endereço
        if (!isset($data['address']['postal_code'])) {
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'CEP do endereço é obrigatório',
                    'error' => 'MISSING_POSTAL_CODE'
                ]))
                ->withStatus(400);
        }

        $connection = $this->Visits->getConnection();
        $connection->begin();

        try {
            // Criar endereço
            $addressesTable = $this->fetchTable('Addresses');
            $address = $addressesTable->newEntity($data['address']);

            if (!$addressesTable->save($address)) {
                $connection->rollback();
                return $this->response
                    ->withType('application/json')
                    ->withStringBody(json_encode([
                        'success' => false,
                        'message' => 'Erro ao salvar endereço',
                        'errors' => $address->getErrors()
                    ]))
                    ->withStatus(400);
            }

            // Criar visita
            $visitData = [
                'date' => $data['date'],
                'forms' => (int)$data['forms'],
                'products' => (int)$data['products'],
                'completed' => $data['completed'] ?? false,
                'address_id' => $address->id
            ];

            $visit = $this->Visits->newEntity($visitData);

            if (!$this->Visits->save($visit)) {
                $connection->rollback();
                return $this->response
                    ->withType('application/json')
                    ->withStringBody(json_encode([
                        'success' => false,
                        'message' => 'Erro ao salvar visita',
                        'errors' => $visit->getErrors()
                    ]))
                    ->withStatus(400);
            }

            $connection->commit();

            // Recarregar com endereço
            $visit = $this->Visits->get($visit->id, ['contain' => ['Addresses']]);

            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => true,
                    'message' => 'Visita criada com sucesso',
                    'data' => $visit
                ]))
                ->withStatus(201);

        } catch (\Exception $e) {
            $connection->rollback();
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Erro interno do servidor',
                    'error' => $e->getMessage()
                ]))
                ->withStatus(500);
        }
    }

    /**
     * Edit method - editar visita existente
     *
     * @param string|null $id Visit id.
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function edit($id = null)
    {
        $this->request->allowMethod(['put', 'patch']);

        $visit = $this->Visits->get($id, ['contain' => ['Addresses']]);
        $data = $this->request->getData();

        $connection = $this->Visits->getConnection();
        $connection->begin();

        try {
            // Se endereço foi alterado, criar novo (não editar)
            if (isset($data['address'])) {
                $addressesTable = $this->fetchTable('Addresses');

                // Criar novo endereço
                $newAddress = $addressesTable->newEntity($data['address']);

                if (!$addressesTable->save($newAddress)) {
                    $connection->rollback();
                    return $this->response
                        ->withType('application/json')
                        ->withStringBody(json_encode([
                            'success' => false,
                            'message' => 'Erro ao salvar novo endereço',
                            'errors' => $newAddress->getErrors()
                        ]))
                        ->withStatus(400);
                }

                $oldAddressId = $visit->address_id;
                $data['address_id'] = $newAddress->id;

                // Remover address dos dados para não tentar atualizar
                unset($data['address']);

                // Agendar remoção do endereço antigo se não usado
                $shouldRemoveOldAddress = true;
            }

            // Atualizar visita
            $visit = $this->Visits->patchEntity($visit, $data);

            if (!$this->Visits->save($visit)) {
                $connection->rollback();
                return $this->response
                    ->withType('application/json')
                    ->withStringBody(json_encode([
                        'success' => false,
                        'message' => 'Erro ao atualizar visita',
                        'errors' => $visit->getErrors()
                    ]))
                    ->withStatus(400);
            }

            // Remover endereço antigo se não está sendo usado
            if (isset($shouldRemoveOldAddress) && $shouldRemoveOldAddress) {
                $usageCount = $this->Visits->find()
                    ->where(['address_id' => $oldAddressId])
                    ->count();

                if ($usageCount === 0) {
                    $oldAddress = $addressesTable->get($oldAddressId);
                    $addressesTable->delete($oldAddress);
                }
            }

            $connection->commit();

            // Recarregar com endereço
            $visit = $this->Visits->get($visit->id, ['contain' => ['Addresses']]);

            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => true,
                    'message' => 'Visita atualizada com sucesso',
                    'data' => $visit
                ]));

        } catch (\Exception $e) {
            $connection->rollback();
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Erro interno do servidor',
                    'error' => $e->getMessage()
                ]))
                ->withStatus(500);
        }
    }

    /**
     * Delete method - deletar visita
     *
     * @param string|null $id Visit id.
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function delete($id = null)
    {
        $this->request->allowMethod(['delete']);

        $visit = $this->Visits->get($id);

        if ($this->Visits->delete($visit)) {
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => true,
                    'message' => 'Visita deletada com sucesso'
                ]));
        } else {
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Erro ao deletar visita'
                ]))
                ->withStatus(400);
        }
    }
}