<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Workday Entity
 *
 * @property int $id
 * @property \Cake\I18n\Date $date
 * @property int $visits
 * @property int $completed
 * @property int $duration
 * @property \Cake\I18n\DateTime $created
 * @property \Cake\I18n\DateTime $modified
 */
class Workday extends Entity
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
        'visits' => true,
        'completed' => true,
        'duration' => true,
    ];

    /**
     * Verifica se o dia está completo (8 horas)
     *
     * @return bool
     */
    public function isFull(): bool
    {
        return $this->duration >= 480;
    }

    /**
     * Calcula quantos minutos restam para o limite
     *
     * @return int
     */
    public function getRemainingMinutes(): int
    {
        return max(0, 480 - $this->duration);
    }

    /**
     * Calcula a porcentagem de conclusão das visitas
     *
     * @return float
     */
    public function getCompletionRate(): float
    {
        if ($this->visits === 0) {
            return 0.0;
        }

        return round(($this->completed / $this->visits) * 100, 2);
    }
}