<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\ORM\TableRegistry;
use Cake\Validation\Validator;

/**
 * Workdays Model
 *
 * @method \App\Model\Entity\Workday newEmptyEntity()
 * @method \App\Model\Entity\Workday newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Workday> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Workday get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Workday findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Workday patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Workday> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Workday|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Workday saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Workday> saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Workday> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Workday> deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Workday> deleteManyOrFail(iterable $entities, array $options = [])
 *
 * @mixin \Cake\ORM\Behavior\TimestampBehavior
 */
class WorkdaysTable extends Table
{
    /**
     * Initialize method
     *
     * @param array<string, mixed> $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('workdays');
        $this->setDisplayField('date');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->date('date')
            ->requirePresence('date', 'create')
            ->notEmptyDate('date');

        $validator
            ->integer('visits')
            ->greaterThanOrEqual('visits', 0)
            ->allowEmptyString('visits');

        $validator
            ->integer('completed')
            ->greaterThanOrEqual('completed', 0)
            ->allowEmptyString('completed');

        $validator
            ->integer('duration')
            ->greaterThanOrEqual('duration', 0)
            ->allowEmptyString('duration')
            ->add('duration', 'maxDuration', [
                'rule' => function ($value) {
                    return $value <= 480; // 8 horas = 480 minutos
                },
                'message' => 'Duração não pode exceder 480 minutos (8 horas)'
            ]);

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->isUnique(['date']), ['errorField' => 'date']);

        return $rules;
    }

    /**
     * Atualizar contadores do workday baseado nas visitas
     *
     * @param string $date Data no formato Y-m-d
     * @return bool
     */
    public function updateCounters(string $date): bool
    {
        $visitsTable = TableRegistry::getTableLocator()->get('Visits');

        // Buscar estatísticas das visitas para esta data usando queries separadas
        $totalVisits = $visitsTable->find()
            ->where(['date' => $date])
            ->count();

        $completedVisits = $visitsTable->find()
            ->where(['date' => $date, 'completed' => true])
            ->count();

        $totalDuration = $visitsTable->find()
            ->where(['date' => $date])
            ->select(['total' => 'SUM(duration)'])
            ->first();

        $duration = $totalDuration ? (int)$totalDuration->total : 0;

        // Buscar ou criar workday
        $workday = $this->find()
            ->where(['date' => $date])
            ->first();

        if (!$workday) {
            $workday = $this->newEntity([
                'date' => $date,
                'visits' => 0,
                'completed' => 0,
                'duration' => 0
            ]);
        }

        // Atualizar valores
        $workday->visits = $totalVisits;
        $workday->completed = $completedVisits;
        $workday->duration = $duration;

        return $this->save($workday) !== false;
    }

    /**
     * Verificar se o dia pode receber mais visitas
     *
     * @param string $date Data no formato Y-m-d
     * @param int $additionalDuration Duração adicional em minutos
     * @return bool
     */
    public function canAddDuration(string $date, int $additionalDuration): bool
    {
        $workday = $this->find()
            ->where(['date' => $date])
            ->first();

        $currentDuration = $workday ? $workday->duration : 0;

        return ($currentDuration + $additionalDuration) <= 480;
    }

    /**
     * Encontrar próximo dia disponível com capacidade
     *
     * @param string $startDate Data inicial
     * @param int $requiredDuration Duração necessária em minutos
     * @return string|null Data disponível ou null se não encontrar
     */
    public function findNextAvailableDay(string $startDate, int $requiredDuration): ?string
    {
        $date = new \DateTime($startDate);

        for ($i = 0; $i < 30; $i++) { // Buscar nos próximos 30 dias
            $dateStr = $date->format('Y-m-d');

            if ($this->canAddDuration($dateStr, $requiredDuration)) {
                return $dateStr;
            }

            $date->modify('+1 day');
        }

        return null;
    }
}