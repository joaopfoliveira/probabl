# 🚀 Guia de Migração para Supabase

## 🎯 **Visão Geral**

Este guia irá migrar suas betting tips de **arquivos JSON** para **Supabase PostgreSQL**, resolvendo definitivamente o problema do filesystem read-only do Vercel.

---

## ✅ **Vantagens da Migração**

### **Antes (Arquivos JSON):**
❌ Filesystem read-only no Vercel  
❌ Complexidade com GitHub API  
❌ Performance lenta para muitos tips  
❌ Sem queries eficientes  
❌ Sem concurrent updates  

### **Depois (Supabase):**
✅ **Performance superior**  
✅ **Queries SQL eficientes**  
✅ **Funciona perfeitamente no Vercel**  
✅ **Interface administrativa excelente**  
✅ **Transações seguras**  
✅ **Sem limitações de filesystem**  
✅ **Backup automático**  

---

## 🔧 **Setup Passo a Passo**

### **Passo 1: Configurar Supabase**

1. **Acesse seu projeto Supabase**: https://supabase.com/dashboard
2. **Vá para**: SQL Editor
3. **Execute o schema**: Copie e cole todo o conteúdo de `supabase-schema.sql`
4. **Clique em**: "RUN" para criar as tabelas

### **Passo 2: Configurar Variáveis de Ambiente**

Adicione estas variáveis ao seu `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Para encontrar suas credenciais:**
1. **Dashboard Supabase** → Settings → API
2. **Project URL**: Copie para `NEXT_PUBLIC_SUPABASE_URL`
3. **Project API keys** → `anon public`: Copie para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Passo 3: Migrar Dados Existentes**

Execute o script de migração:

```bash
npm run migrate:supabase
```

**O que acontece:**
- ✅ Lê todos os arquivos JSON da pasta `data/daily/`
- ✅ Valida cada arquivo
- ✅ Transfere para Supabase (apenas arquivos novos)
- ✅ Mostra progresso detalhado
- ✅ Preserva todos os dados existentes

### **Passo 4: Atualizar APIs para Supabase**

Agora vou atualizar as APIs para usar o Supabase em vez de arquivos JSON:

---

## 📊 **Estrutura da Base de Dados**

### **Tabelas Criadas:**

1. **`tips`** - Tips principais
   - `id`, `date_iso`, `bet_type`, `risk`, `rationale`, `result`
   - `combined_avg_odds`, `combined_bookmakers`

2. **`tip_legs`** - Legs individuais de cada tip
   - `sport`, `league`, `event_name`, `market`, `selection`
   - `scheduled_at`, `avg_odds`

3. **`bookmaker_odds`** - Odds de cada bookmaker
   - `bookmaker_name`, `odds`, `bookmaker_url`

4. **`daily_metadata`** - Metadados SEO e estatísticas
   - `seo_title`, `seo_description`, contadores

### **Views Otimizadas:**

- **`v_tips_complete`** - Tips com todas as informações
- **`v_daily_summary`** - Resumo diário com estatísticas

---

## 🎯 **Funcionalidades Incluídas**

### **✅ Migração Automática**
- Transfere todos os dados JSON existentes
- Preserva estrutura V2 completa
- Validação automática

### **✅ APIs Otimizadas**
- Queries SQL eficientes
- Paginação nativa
- Filtros avançados

### **✅ Admin Panel Atualizado**
- Funciona perfeitamente no Vercel
- Updates em tempo real
- Sem limitações de filesystem

### **✅ Performance Melhorada**
- Queries indexadas
- Carregamento mais rápido
- Menos uso de memória

---

## 🚀 **Deployment no Vercel**

### **Variáveis de Ambiente no Vercel:**

1. **Dashboard Vercel** → Your Project → Settings → Environment Variables
2. **Adicione**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   ```

### **Deploy:**
```bash
git add .
git commit -m "Migrate to Supabase database"
git push origin main
```

**Vercel automaticamente:**
- ✅ Rebuilda com as novas APIs
- ✅ Usa Supabase em produção
- ✅ **Resolve o problema do filesystem read-only!**

---

## 🔍 **Testing & Verificação**

### **1. Teste Local:**
```bash
npm run dev
# Navegue para http://localhost:3000
# Teste criar/atualizar tips no admin panel
```

### **2. Verifique no Supabase:**
- **Dashboard** → Table Editor → `tips`
- Veja suas tips migradas
- Teste queries diretamente

### **3. Teste em Produção:**
- Admin panel deve funcionar perfeitamente
- Sem mais erros de "read-only filesystem"
- Updates instantâneos

---

## 🛠️ **Troubleshooting**

### **❌ "Cannot connect to Supabase"**
- ✅ Verifique URLs e API keys
- ✅ Confirme que o schema foi executado
- ✅ Teste conexão no dashboard

### **❌ "Migration failed"**  
- ✅ Execute `npm run migrate:supabase` novamente
- ✅ Verifique logs para erros específicos
- ✅ Confirme estrutura dos JSON files

### **❌ "Environment variables missing"**
- ✅ Confirme `.env.local` local
- ✅ Adicione variáveis no Vercel
- ✅ Redeploy após adicionar variáveis

---

## 📊 **Schema SQL (Referência)**

O arquivo `supabase-schema.sql` contém:

- ✅ **4 tabelas principais** otimizadas
- ✅ **Índices** para performance
- ✅ **Views** para queries complexas  
- ✅ **Triggers** para updates automáticos
- ✅ **Constraints** para integridade de dados
- ✅ **Row Level Security** (opcional)

---

## 🎉 **Resultado Final**

Depois da migração você terá:

✅ **Admin panel funcional no Vercel**  
✅ **Performance superior**  
✅ **Queries SQL poderosas**  
✅ **Interface Supabase para administração**  
✅ **Backup automático**  
✅ **Sem mais problemas de filesystem**  
✅ **Escalabilidade para o futuro**  

---

**🚀 Pronto para migrar? Siga os passos e sua aplicação estará funcionando perfeitamente em produção!**
