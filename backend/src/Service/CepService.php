<?php
declare(strict_types=1);

namespace App\Service;

use Cake\Http\Client;
use Cake\Log\Log;

/**
 * Serviço para consulta de CEP
 *
 * Implementa fallback entre República Virtual e Via CEP
 */
class CepService
{
    private Client $httpClient;

    public function __construct()
    {
        $this->httpClient = new Client([
            'timeout' => 10,
            'headers' => [
                'User-Agent' => 'CakePHP-App/1.0'
            ]
        ]);
    }

    /**
     * Consultar CEP usando fallback entre APIs
     *
     * @param string $postalCode CEP para consulta
     * @return array|null Dados do endereço ou null se não encontrado
     */
    public function lookup(string $postalCode): ?array
    {
        // Limpar CEP (remover caracteres não numéricos)
        $cleanCode = preg_replace('/\D/', '', $postalCode);

        if (strlen($cleanCode) !== 8) {
            return null;
        }

        // Tentar República Virtual primeiro
        $result = $this->tryRepublicaVirtual($cleanCode);

        if ($result !== null) {
            Log::info("CEP {$cleanCode} encontrado via República Virtual");
            return $result;
        }

        // Fallback para Via CEP
        $result = $this->tryViaCep($cleanCode);

        if ($result !== null) {
            Log::info("CEP {$cleanCode} encontrado via Via CEP (fallback)");
            return $result;
        }

        Log::warning("CEP {$cleanCode} não encontrado em nenhuma API");
        return null;
    }

    /**
     * Consultar CEP na API República Virtual
     *
     * @param string $cleanCode CEP limpo (8 dígitos)
     * @return array|null
     */
    private function tryRepublicaVirtual(string $cleanCode): ?array
    {
        try {
            $url = "https://cep.republicavirtual.com.br/web_cep.php";
            $response = $this->httpClient->post($url, [
                'cep' => $cleanCode,
                'formato' => 'json'
            ]);

            if (!$response->isOk()) {
                Log::warning("República Virtual API retornou status {$response->getStatusCode()}");
                return null;
            }

            $data = $response->getJson();

            // República Virtual retorna resultado: 1 para sucesso
            if (!isset($data['resultado']) || $data['resultado'] != 1) {
                return null;
            }

            return [
                'postal_code' => $this->formatPostalCode($cleanCode),
                'sublocality' => $data['distrito'] ?? null,
                'street' => $data['logradouro'] ?? null,
                'city' => $data['cidade'] ?? null,
                'state' => $data['uf'] ?? null
            ];

        } catch (\Exception $e) {
            Log::error("Erro ao consultar República Virtual: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Consultar CEP na API Via CEP
     *
     * @param string $cleanCode CEP limpo (8 dígitos)
     * @return array|null
     */
    private function tryViaCep(string $cleanCode): ?array
    {
        try {
            $url = "https://viacep.com.br/ws/{$cleanCode}/json/";
            $response = $this->httpClient->get($url);

            if (!$response->isOk()) {
                Log::warning("Via CEP API retornou status {$response->getStatusCode()}");
                return null;
            }

            $data = $response->getJson();

            // Via CEP retorna 'erro': true quando CEP não existe
            if (isset($data['erro']) && $data['erro'] === true) {
                return null;
            }

            return [
                'postal_code' => $this->formatPostalCode($cleanCode),
                'sublocality' => $data['bairro'] ?? null,
                'street' => $data['logradouro'] ?? null,
                'city' => $data['localidade'] ?? null,
                'state' => $data['uf'] ?? null
            ];

        } catch (\Exception $e) {
            Log::error("Erro ao consultar Via CEP: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Formatar CEP com máscara
     *
     * @param string $cleanCode CEP limpo
     * @return string CEP formatado
     */
    private function formatPostalCode(string $cleanCode): string
    {
        return substr($cleanCode, 0, 5) . '-' . substr($cleanCode, 5);
    }

    /**
     * Validar formato do CEP
     *
     * @param string $postalCode CEP para validar
     * @return bool
     */
    public function isValidFormat(string $postalCode): bool
    {
        return (bool) preg_match('/^\d{5}-?\d{3}$/', $postalCode);
    }

    /**
     * Limpar CEP removendo formatação
     *
     * @param string $postalCode CEP com ou sem formatação
     * @return string CEP limpo
     */
    public function cleanPostalCode(string $postalCode): string
    {
        return preg_replace('/\D/', '', $postalCode);
    }
}