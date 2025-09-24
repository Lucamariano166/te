<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;
use Cake\Event\EventInterface;
use ArrayObject;
use App\Service\CepService;

/**
 * Addresses Model
 *
 * @property \App\Model\Table\VisitsTable&\Cake\ORM\Association\HasMany $Visits
 *
 * @method \App\Model\Entity\Address newEmptyEntity()
 * @method \App\Model\Entity\Address newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Address> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Address get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Address findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Address patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Address> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Address|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Address saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Address> saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Address> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Address> deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Address> deleteManyOrFail(iterable $entities, array $options = [])
 *
 * @mixin \Cake\ORM\Behavior\TimestampBehavior
 */
class AddressesTable extends Table
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

        $this->setTable('addresses');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');

        $this->hasMany('Visits', [
            'foreignKey' => 'address_id',
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
            ->scalar('postal_code')
            ->maxLength('postal_code', 9)
            ->requirePresence('postal_code', 'create')
            ->notEmptyString('postal_code')
            ->add('postal_code', 'validFormat', [
                'rule' => function ($value) {
                    // Aceita formato 00000-000 ou 00000000
                    return (bool) preg_match('/^\d{5}-?\d{3}$/', $value);
                },
                'message' => 'CEP deve estar no formato 00000-000 ou 00000000'
            ]);

        $validator
            ->scalar('sublocality')
            ->maxLength('sublocality', 255)
            ->allowEmptyString('sublocality');

        $validator
            ->scalar('street')
            ->maxLength('street', 255)
            ->allowEmptyString('street');

        $validator
            ->scalar('street_number')
            ->maxLength('street_number', 20)
            ->allowEmptyString('street_number');

        $validator
            ->scalar('complement')
            ->maxLength('complement', 255)
            ->allowEmptyString('complement');

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
        return $rules;
    }

    /**
     * Evento beforeSave - consultar CEP automaticamente
     *
     * @param \Cake\Event\EventInterface $event
     * @param \App\Model\Entity\Address $entity
     * @param \ArrayObject $options
     * @return bool
     */
    public function beforeSave(EventInterface $event, $entity, ArrayObject $options): bool
    {
        // Se o CEP foi alterado, consultar APIs
        if ($entity->isDirty('postal_code') && !empty($entity->postal_code)) {
            $cepService = new CepService();

            // Validar formato antes de consultar
            if (!$cepService->isValidFormat($entity->postal_code)) {
                $entity->setError('postal_code', 'CEP deve estar no formato 00000-000 ou 00000000');
                return false;
            }

            $addressData = $cepService->lookup($entity->postal_code);

            if ($addressData === null) {
                $entity->setError('postal_code', 'CEP não encontrado');
                return false;
            }

            // Preservar dados já preenchidos pelo usuário
            // Só atualizar campos vazios
            if (empty($entity->sublocality) && !empty($addressData['sublocality'])) {
                $entity->sublocality = $addressData['sublocality'];
            }

            if (empty($entity->street) && !empty($addressData['street'])) {
                $entity->street = $addressData['street'];
            }

            // Sempre atualizar o CEP com formatação correta
            $entity->postal_code = $addressData['postal_code'];
        }

        return true;
    }

    /**
     * Formatar CEP com máscara
     *
     * @param string $postalCode CEP sem formatação
     * @return string CEP formatado como 00000-000
     */
    public function formatPostalCode(string $postalCode): string
    {
        $cleanCode = preg_replace('/\D/', '', $postalCode);

        if (strlen($cleanCode) === 8) {
            return substr($cleanCode, 0, 5) . '-' . substr($cleanCode, 5);
        }

        return $postalCode;
    }

    /**
     * Consultar CEP manualmente
     *
     * @param string $postalCode CEP para consulta
     * @return array|null Dados do endereço ou null se não encontrado
     */
    public function lookupPostalCode(string $postalCode): ?array
    {
        $cepService = new CepService();
        return $cepService->lookup($postalCode);
    }
}