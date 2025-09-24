<?php
declare(strict_types=1);

namespace App\Controller;

/**
 * Workdays Controller
 *
 * @property \App\Model\Table\WorkdaysTable $Workdays
 */
class WorkdaysController extends AppController
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
     * Index method - listar dias de trabalho
     *
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function index()
    {
        $this->request->allowMethod(['get']);

        $startDate = $this->request->getQuery('start_date');
        $endDate = $this->request->getQuery('end_date');
        $limit = $this->request->getQuery('limit', 30);

        $query = $this->Workdays->find()
            ->orderBy(['date' => 'DESC']);

        // Filtrar por período se fornecido
        if (!empty($startDate)) {
            $query->where(['date >=' => $startDate]);
        }

        if (!empty($endDate)) {
            $query->where(['date <=' => $endDate]);
        }

        $workdays = $query->limit((int)$limit)->toArray();

        return $this->response
            ->withType('application/json')
            ->withStringBody(json_encode([
                'success' => true,
                'data' => $workdays,
                'count' => count($workdays)
            ]));
    }

    /**
     * View method - visualizar um dia específico
     *
     * @param string|null $date Data no formato Y-m-d
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function view($date = null)
    {
        $this->request->allowMethod(['get']);

        if (empty($date)) {
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Data é obrigatória',
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

        // Buscar ou criar workday
        $workday = $this->Workdays->find()
            ->where(['date' => $date])
            ->first();

        if (!$workday) {
            // Atualizar contadores para criar o workday
            $this->Workdays->updateCounters($date);

            $workday = $this->Workdays->find()
                ->where(['date' => $date])
                ->first();
        }

        // Buscar visitas do dia
        $visitsTable = $this->fetchTable('Visits');
        $visits = $visitsTable->find()
            ->contain(['Addresses'])
            ->where(['date' => $date])
            ->orderBy(['Visits.created' => 'ASC'])
            ->toArray();

        return $this->response
            ->withType('application/json')
            ->withStringBody(json_encode([
                'success' => true,
                'data' => [
                    'workday' => $workday,
                    'visits' => $visits
                ]
            ]));
    }

    /**
     * Close method - fechar dia de trabalho e realocar visitas pendentes
     *
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function close()
    {
        $this->request->allowMethod(['post']);

        $data = $this->request->getData();
        $date = $data['date'] ?? null;

        if (empty($date)) {
            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Data é obrigatória',
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

        $connection = $this->Workdays->getConnection();
        $connection->begin();

        try {
            $visitsTable = $this->fetchTable('Visits');

            // Buscar visitas pendentes da data
            $pendingVisits = $visitsTable->findPendingByDate($date);

            $reallocatedVisits = [];
            $failedReallocations = [];

            foreach ($pendingVisits as $visit) {
                $nextAvailableDate = $this->Workdays->findNextAvailableDay(
                    $date,
                    $visit->duration
                );

                if ($nextAvailableDate) {
                    $visit->date = new \Cake\I18n\Date($nextAvailableDate);

                    if ($visitsTable->save($visit)) {
                        $reallocatedVisits[] = [
                            'visit_id' => $visit->id,
                            'from_date' => $date,
                            'to_date' => $nextAvailableDate,
                            'duration' => $visit->duration
                        ];
                    } else {
                        $failedReallocations[] = [
                            'visit_id' => $visit->id,
                            'error' => 'Erro ao salvar visita'
                        ];
                    }
                } else {
                    $failedReallocations[] = [
                        'visit_id' => $visit->id,
                        'error' => 'Nenhum dia disponível encontrado nos próximos 30 dias'
                    ];
                }
            }

            // Atualizar contadores de todos os workdays afetados
            $affectedDates = array_unique(array_merge(
                [$date],
                array_column($reallocatedVisits, 'to_date')
            ));

            foreach ($affectedDates as $affectedDate) {
                $this->Workdays->updateCounters($affectedDate);
            }

            $connection->commit();

            return $this->response
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => true,
                    'message' => 'Dia fechado com sucesso',
                    'data' => [
                        'closed_date' => $date,
                        'reallocated_visits' => $reallocatedVisits,
                        'failed_reallocations' => $failedReallocations,
                        'summary' => [
                            'total_pending' => count($pendingVisits),
                            'successfully_reallocated' => count($reallocatedVisits),
                            'failed_reallocations' => count($failedReallocations)
                        ]
                    ]
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
     * Statistics method - estatísticas gerais
     *
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function statistics()
    {
        $this->request->allowMethod(['get']);

        // Estatísticas dos últimos 30 dias
        $thirtyDaysAgo = date('Y-m-d', strtotime('-30 days'));

        $workdays = $this->Workdays->find()
            ->where(['date >=' => $thirtyDaysAgo])
            ->toArray();

        $totalDays = count($workdays);
        $totalVisits = array_sum(array_column($workdays, 'visits'));
        $totalCompleted = array_sum(array_column($workdays, 'completed'));
        $totalDuration = array_sum(array_column($workdays, 'duration'));

        $averageVisitsPerDay = $totalDays > 0 ? round($totalVisits / $totalDays, 2) : 0;
        $completionRate = $totalVisits > 0 ? round(($totalCompleted / $totalVisits) * 100, 2) : 0;
        $averageDurationPerDay = $totalDays > 0 ? round($totalDuration / $totalDays, 2) : 0;

        return $this->response
            ->withType('application/json')
            ->withStringBody(json_encode([
                'success' => true,
                'data' => [
                    'period' => [
                        'start_date' => $thirtyDaysAgo,
                        'end_date' => date('Y-m-d'),
                        'total_days' => $totalDays
                    ],
                    'totals' => [
                        'visits' => $totalVisits,
                        'completed' => $totalCompleted,
                        'duration_minutes' => $totalDuration,
                        'duration_hours' => round($totalDuration / 60, 2)
                    ],
                    'averages' => [
                        'visits_per_day' => $averageVisitsPerDay,
                        'completion_rate_percent' => $completionRate,
                        'duration_per_day_minutes' => $averageDurationPerDay,
                        'duration_per_day_hours' => round($averageDurationPerDay / 60, 2)
                    ]
                ]
            ]));
    }
}