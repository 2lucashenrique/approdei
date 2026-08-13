# Plano de Correção: Registro de Abastecimentos e Despesas

O objetivo é corrigir a falha no registro de novos abastecimentos e transações (despesas/receitas), garantindo que os dados sejam salvos no banco de dados em nuvem (Supabase) em vez do armazenamento local (IndexedDB).

## Alterações Propostas

### 1. Atualizar Wrappers de Páginas
Os arquivos `AddRefuelPageWrapper.tsx` e `AddTransactionPageWrapper.tsx` ainda estão utilizando `useIndexedDB`. Eles serão atualizados para usar os hooks `useUserRefuels`, `useUserTransactions` e `useUserSettings`, conectando-os diretamente ao backend.

### 2. Sincronizar Abastecimento com Transação
Ao registrar um abastecimento, o sistema deve criar automaticamente uma transação de despesa correspondente no banco de dados. A lógica será ajustada para lidar com a natureza assíncrona do backend, garantindo que ambos os registros sejam criados.

### 3. Ajustar Tipagem e Limpeza de Dados
Garantir que os formulários de adição (`AddRefuelPage.tsx` e `AddTransactionPage.tsx`) não enviem IDs manuais para o backend, permitindo que o banco de dados gere os identificadores únicos automaticamente.

## Detalhes Técnicos

- **Modificar `src/pages/AddRefuelPageWrapper.tsx`**: Substituir `useIndexedDB` por hooks do `useUserData.ts`.
- **Modificar `src/pages/AddTransactionPageWrapper.tsx`**: Substituir `useIndexedDB` por hooks do `useUserData.ts`.
- **Modificar `src/pages/AddRefuelPage.tsx`**: Garantir que o valor total seja tratado como número corretamente.
- **Modificar `src/pages/AddTransactionPage.tsx`**: Garantir que o valor seja tratado como número corretamente.
