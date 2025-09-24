<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Address Entity
 *
 * @property int $id
 * @property string $postal_code
 * @property string|null $sublocality
 * @property string|null $street
 * @property string|null $street_number
 * @property string|null $complement
 * @property \Cake\I18n\DateTime $created
 * @property \Cake\I18n\DateTime $modified
 *
 * @property \App\Model\Entity\Visit[] $visits
 */
class Address extends Entity
{
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array<string, bool>
     */
    protected array $_accessible = [
        'postal_code' => true,
        'sublocality' => true,
        'street' => true,
        'street_number' => true,
        'complement' => true,
        'visits' => true,
    ];

    /**
     * Getter para postal_code - aplica máscara automaticamente
     *
     * @param string $postalCode
     * @return string
     */
    protected function _getPostalCode(string $postalCode): string
    {
        $cleanCode = preg_replace('/\D/', '', $postalCode);

        if (strlen($cleanCode) === 8) {
            return substr($cleanCode, 0, 5) . '-' . substr($cleanCode, 5);
        }

        return $postalCode;
    }

    /**
     * Setter para postal_code - remove formatação antes de salvar
     *
     * @param string $postalCode
     * @return string
     */
    protected function _setPostalCode(string $postalCode): string
    {
        return preg_replace('/\D/', '', $postalCode);
    }
}