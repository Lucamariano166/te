<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class CreateVisits extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('visits');

        $table->addColumn('date', 'date', [
            'null' => false,
            'comment' => 'Data da visita programada'
        ]);

        $table->addColumn('status', 'string', [
            'limit' => 20,
            'default' => 'pending',
            'null' => false,
            'comment' => 'Status da visita: pending ou completed'
        ]);

        $table->addColumn('forms', 'integer', [
            'default' => 0,
            'null' => false,
            'comment' => 'Quantidade de formulários (15 min cada)'
        ]);

        $table->addColumn('products', 'integer', [
            'default' => 0,
            'null' => false,
            'comment' => 'Quantidade de produtos (5 min cada)'
        ]);

        $table->addColumn('completed', 'boolean', [
            'default' => false,
            'null' => false,
            'comment' => 'Se a visita foi concluída'
        ]);

        $table->addColumn('duration', 'integer', [
            'default' => 0,
            'null' => false,
            'comment' => 'Duração calculada em minutos (forms*15 + products*5)'
        ]);

        $table->addColumn('address_id', 'integer', [
            'null' => false,
            'comment' => 'Referência para a tabela addresses'
        ]);

        $table->addColumn('created', 'datetime', [
            'null' => false
        ]);

        $table->addColumn('modified', 'datetime', [
            'null' => false
        ]);

        $table->addIndex(['date']);
        $table->addIndex(['status']);
        $table->addIndex(['address_id']);

        $table->addForeignKey('address_id', 'addresses', 'id', [
            'delete' => 'RESTRICT',
            'update' => 'CASCADE'
        ]);

        $table->create();
    }
}