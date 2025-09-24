export interface Address {
  id?: number;
  postal_code: string;
  sublocality?: string;
  street?: string;
  street_number?: string;
  complement?: string;
  created?: string;
  modified?: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressFormData {
  postal_code: string;
  sublocality: string;
  street: string;
  street_number: string;
  complement: string;
}