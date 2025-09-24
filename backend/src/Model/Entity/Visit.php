<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Visit Entity
 *
 * @property int $id
 * @property \Cake\I18n\Date $date
 * @property string $status
 * @property int $forms
 * @property int $products
 * @property bool $completed
 * @property int $duration
 * @property int $address_id
 * @property \Cake\I18n\DateTime $created
 * @property \Cake\I18n\DateTime $modified
 *
 * @property \App\Model\Entity\Address $address
 */
class Visit extends Entity
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
        'date' => true,
        'status' => true,
        'forms' => true,
        'products' => true,
        'completed' => true,
        'address_id' => true,
        'address' => true,
    ];

    /**
     * Setter para forms - recalcular duração automaticamente
     *
     * @param int $forms
     * @return void
     */
    protected function _setForms(int $forms): int
    {
        $this->_calculateDuration();
        return $forms;
    }

    /**
     * Setter para products - recalcular duração automaticamente
     *
     * @param int $products
     * @return void
     */
    protected function _setProducts(int $products): int
    {
        $this->_calculateDuration();
        return $products;
    }

    /**
     * Setter para completed - atualizar status
     *
     * @param bool $completed
     * @return bool
     */
    protected function _setCompleted(bool $completed): bool
    {
        $this->status = $completed ? 'completed' : 'pending';
        return $completed;
    }

    /**
     * Calcular duração baseada em formulários e produtos
     *
     * @return void
     */
    protected function _calculateDuration(): void
    {
        $forms = $this->forms ?? 0;
        $products = $this->products ?? 0;

        $this->duration = ($forms * 15) + ($products * 5);
    }

    /**
     * Verifica se a visita está concluída
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->completed === true || $this->status === 'completed';
    }

    /**
     * Calcular duração total em horas formatadas
     *
     * @return string
     */
    public function getFormattedDuration(): string
    {
        $hours = intval($this->duration / 60);
        $minutes = $this->duration % 60;

        if ($hours > 0) {
            return sprintf('%dh %dmin', $hours, $minutes);
        }

        return sprintf('%dmin', $minutes);
    }
}