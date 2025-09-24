<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class CreateAddresses extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('addresses');

        $table->addColumn('postal_code', 'string', [
            'limit' => 9,
            'null' => false,
            'comment' => 'CEP no formato 00000-000'
        ]);

        $table->addColumn('sublocality', 'string', [
            'limit' => 255,
            'null' => true,
            'comment' => 'Bairro/Sublocality'
        ]);

        $table->addColumn('street', 'string', [
            'limit' => 255,
            'null' => true,
            'comment' => 'Nome da rua'
        ]);

        $table->addColumn('street_number', 'string', [
            'limit' => 20,
            'null' => true,
            'comment' => 'Número da residência'
        ]);

        $table->addColumn('complement', 'string', [
            'limit' => 255,
            'null' => true,
            'comment' => 'Complemento do endereço'
        ]);

        $table->addColumn('created', 'datetime', [
            'null' => false
        ]);

        $table->addColumn('modified', 'datetime', [
            'null' => false
        ]);

        $table->addIndex(['postal_code']);
        $table->create();
    }
}