<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\ORM\TableRegistry;
use Cake\Validation\Validator;
use Cake\Event\EventInterface;
use ArrayObject;

/**
 * Visits Model
 *
 * @property \App\Model\Table\AddressesTable&\Cake\ORM\Association\BelongsTo $Addresses
 *
 * @method \App\Model\Entity\Visit newEmptyEntity()
 * @method \App\Model\Entity\Visit newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Visit> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Visit get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Visit findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Visit patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Visit> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Visit|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Visit saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Visit> saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Visit> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Visit> deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Visit> deleteManyOrFail(iterable $entities, array $options = [])
 *
 * @mixin \Cake\ORM\Behavior\TimestampBehavior
 */
class VisitsTable extends Table
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

        $this->setTable('visits');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');

        $this->belongsTo('Addresses', [
            'foreignKey' => 'address_id',
            'joinType' => 'INNER',
        ]);
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
            ->scalar('status')
            ->inList('status', ['pending', 'completed'])
            ->allowEmptyString('status');

        $validator
            ->integer('forms')
            ->range('forms', [1, null], 'O número de formulários deve ser maior que 0')
            ->allowEmptyString('forms');

        $validator
            ->integer('products')
            ->range('products', [1, null], 'O número de produtos deve ser maior que 0')
            ->allowEmptyString('products');

        $validator
            ->boolean('completed')
            ->allowEmptyString('completed');

        $validator
            ->integer('duration')
            ->range('duration', [0, null], 'A duração deve ser um número positivo')
            ->allowEmptyString('duration');

        $validator
            ->integer('address_id')
            ->requirePresence('address_id', 'create')
            ->notEmptyString('address_id');

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
        $rules->add($rules->existsIn('address_id', 'Addresses'), ['errorField' => 'address_id']);

        return $rules;
    }

    /**
     * Evento beforeSave - calcular duração e validar limite de horas
     *
     * @param \Cake\Event\EventInterface $event
     * @param \App\Model\Entity\Visit $entity
     * @param \ArrayObject $options
     * @return bool
     */
    public function beforeSave(EventInterface $event, $entity, ArrayObject $options): bool
    {
        // Calcular duração baseada em formulários e produtos
        $entity->duration = ($entity->forms * 15) + ($entity->products * 5);

        // Atualizar status completed baseado no campo completed
        $entity->status = $entity->completed ? 'completed' : 'pending';

        // Verificar limite de horas do dia
        $workdaysTable = TableRegistry::getTableLocator()->get('Workdays');

        // Se é uma nova entidade ou a data foi alterada
        if ($entity->isNew() || $entity->isDirty('date')) {
            $canAdd = $workdaysTable->canAddDuration($entity->date->format('Y-m-d'), $entity->duration);

            if (!$canAdd) {
                $entity->setError('date', 'Limite de 8 horas diárias atingido para esta data');
                return false;
            }
        }

        return true;
    }

    /**
     * Evento afterSave - atualizar workday correspondente
     *
     * @param \Cake\Event\EventInterface $event
     * @param \App\Model\Entity\Visit $entity
     * @param \ArrayObject $options
     * @return void
     */
    public function afterSave(EventInterface $event, $entity, ArrayObject $options): void
    {
        $workdaysTable = TableRegistry::getTableLocator()->get('Workdays');

        // Atualizar workday da data atual
        $workdaysTable->updateCounters($entity->date->format('Y-m-d'));

        // Se a data foi alterada, atualizar workday da data anterior também
        if ($entity->isDirty('date') && !$entity->isNew()) {
            $originalData = $entity->getOriginal('date');
            if ($originalData) {
                $workdaysTable->updateCounters($originalData->format('Y-m-d'));
            }
        }
    }

    /**
     * Evento afterDelete - atualizar workday após deletar visita
     *
     * @param \Cake\Event\EventInterface $event
     * @param \App\Model\Entity\Visit $entity
     * @param \ArrayObject $options
     * @return void
     */
    public function afterDelete(EventInterface $event, $entity, ArrayObject $options): void
    {
        $workdaysTable = TableRegistry::getTableLocator()->get('Workdays');
        $workdaysTable->updateCounters($entity->date->format('Y-m-d'));
    }

    /**
     * Substituir endereço de uma visita (criar novo endereço)
     *
     * @param \App\Model\Entity\Visit $visit
     * @param array $addressData
     * @return bool
     */
    public function replaceAddress($visit, array $addressData): bool
    {
        $addressesTable = TableRegistry::getTableLocator()->get('Addresses');

        // Criar novo endereço
        $newAddress = $addressesTable->newEntity($addressData);

        if (!$addressesTable->save($newAddress)) {
            return false;
        }

        $oldAddressId = $visit->address_id;

        // Atualizar visita com novo endereço
        $visit->address_id = $newAddress->id;

        if (!$this->save($visit)) {
            // Se falhar, deletar o novo endereço criado
            $addressesTable->delete($newAddress);
            return false;
        }

        // Deletar endereço antigo se não há outras visitas usando
        $usageCount = $this->find()
            ->where(['address_id' => $oldAddressId])
            ->count();

        if ($usageCount === 0) {
            $oldAddress = $addressesTable->get($oldAddressId);
            $addressesTable->delete($oldAddress);
        }

        return true;
    }

    /**
     * Buscar visitas pendentes para uma data
     *
     * @param string $date Data no formato Y-m-d
     * @return array
     */
    public function findPendingByDate(string $date): array
    {
        return $this->find()
            ->where([
                'date' => $date,
                'completed' => false
            ])
            ->contain(['Addresses'])
            ->toArray();
    }
}