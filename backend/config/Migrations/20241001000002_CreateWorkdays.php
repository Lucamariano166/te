<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class CreateWorkdays extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('workdays');

        $table->addColumn('date', 'date', [
            'null' => false,
            'comment' => 'Data do dia de trabalho'
        ]);

        $table->addColumn('visits', 'integer', [
            'default' => 0,
            'null' => false,
            'comment' => 'Número total de visitas programadas'
        ]);

        $table->addColumn('completed', 'integer', [
            'default' => 0,
            'null' => false,
            'comment' => 'Número de visitas concluídas'
        ]);

        $table->addColumn('duration', 'integer', [
            'default' => 0,
            'null' => false,
            'comment' => 'Duração total em minutos (máx 480 - 8 horas)'
        ]);

        $table->addColumn('created', 'datetime', [
            'null' => false
        ]);

        $table->addColumn('modified', 'datetime', [
            'null' => false
        ]);

        $table->addIndex(['date'], ['unique' => true]);
        $table->create();
    }
}