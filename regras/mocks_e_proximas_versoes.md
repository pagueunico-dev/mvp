# Mocks e Evolução

## Mock atual
- API fake de pagamento
- Status: pago/pendente

## Como mockar
- `GET /payments/mock` — JSON fixo (implementado na API)
- `POST /payments/mock-multi` — gera N pagamentos de teste para listagem na web
- deixar preparado também uma url para preenchimento dos mocks de pagamento, inclusive com opção para geração de multiplos boletos para aparecerem como pagamento, na sessão web do projeto onde aparecem os pagamentos. [este ponto do projeto pode ser uma outra url]

## Evolução
- Integração real com bancos (ex: APIs Open Banking)
- Webhooks
