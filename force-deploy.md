# 🚀 Force Deploy to Vercel - Fix Mobile Cache Issues

## 🔍 Problema Identificado:
A versão em produção no Vercel não tem as mudanças mais recentes e tem problemas de cache no telemóvel.

## 🛠️ Mudanças Feitas:

### 1. 📝 Arquivo `vercel.json` criado:
- Headers de no-cache para todas as APIs
- Configuração específica para Vercel
- Máxima duração para funções API

### 2. 🔧 Headers Anti-Cache Reforçados:
- `Cache-Control`: mais agressivo
- `Vercel-CDN-Cache-Control`: no-store
- `CDN-Cache-Control`: no-store  
- `Surrogate-Control`: no-store
- Headers específicos para CDN Vercel

### 3. 🎯 APIs Afectadas:
- `/api/tips/latest` (página Today)
- `/api/tips/by-date` (histórico)
- Todas outras APIs via vercel.json

## 🚀 ACÇÕES NECESSÁRIAS:

### PASSO 1: Commit e Push
```bash
git add .
git commit -m "fix: add Vercel cache headers and force no-cache for mobile"
git push origin main
```

### PASSO 2: Force Deploy no Vercel
1. **Vai para**: https://vercel.com/dashboard
2. **Selecciona** o projeto itsprobabl
3. **Clica** em "Deployments"
4. **Clica** "Redeploy" no último deployment
5. **OU** faz push de um novo commit

### PASSO 3: Verificação
Após deployment:
```bash
curl -I https://itsprobabl.com/api/tips/latest
```

Deve retornar:
```
HTTP/1.1 200 OK
cache-control: no-cache, no-store, must-revalidate, max-age=0
vercel-cdn-cache-control: no-store
```

## 🎯 Para Testar no Telemóvel:

### Método 1: Forçar Refresh
1. **Abre** https://itsprobabl.com/today no browser móvel
2. **Pull down** para refresh (Safari/Chrome)
3. **OU** fecha e reabre o browser completamente

### Método 2: Modo Incógnito
1. **Abre** modo privado/incógnito
2. **Vai para** https://itsprobabl.com/today
3. **Deve mostrar** tips mais recentes

### Método 3: Clear Cache Manual
1. **Vai para** definições do browser
2. **Limpa** dados de navegação/cache
3. **Visita** https://itsprobabl.com/today

## ⚠️ Se Continuar com Problemas:

### Opção A: Cache Buster
Adiciona `?v=TIMESTAMP` ao URL:
```
https://itsprobabl.com/today?v=1234567890
```

### Opção B: Force Refresh da API
```bash
curl https://itsprobabl.com/api/cache/clear
```

## 📊 Verificação Final:
Após deployment, a página Today deve:
- ✅ Mostrar tips mais recentes
- ✅ Funcionar no telemóvel  
- ✅ Actualizar sem refresh manual
- ✅ Não guardar cache antigo

**🎉 Com estas mudanças, o cache do telemóvel deve ser resolvido!**
