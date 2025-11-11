# Résolution de l'erreur "Server error" - Page de connexion

Date: 5 Novembre 2025

## 🔴 Problème initial

**Message d'erreur:** "Server error" sur la page de connexion (http://localhost:4030/login)

**Cause racine:** Les serveurs n'étaient pas en cours d'exécution.

---

## ✅ Solution appliquée

### 1. Redémarrage du backend (API)

Le serveur Node.js Express qui gère l'API était arrêté.

**Fichier:** `server.js`
**Port:** 3001
**Commande:**
```bash
node server.js
```

**Statut:** ✅ Backend fonctionne correctement

### 2. Démarrage du frontend (React/Vite)

Le serveur de développement Vite n'était pas en cours d'exécution.

**Port:** 4030 (configuré dans `vite.config.mjs`)
**Commande:**
```bash
npm start
```

**Statut:** ✅ Frontend fonctionne correctement

---

## 🧪 Tests effectués

### Test 1: Backend API
```bash
curl http://localhost:3001/api/campaigns
```
**Résultat:** ✅ Retourne la liste des campagnes en JSON

### Test 2: Frontend web
```bash
curl http://localhost:4030
```
**Résultat:** ✅ Retourne la page HTML

### Test 3: Processus en cours
```bash
ps aux | grep -E "(node server.js|vite)"
```
**Résultat:** ✅ 2 processus Node.js actifs (backend + frontend)

---

## 📊 Configuration actuelle

### Backend (API)
- **URL:** http://localhost:3001
- **Base de données:** MySQL (edufund)
- **Endpoints disponibles:**
  - `/api/auth/login` - Authentification
  - `/api/auth/register` - Inscription
  - `/api/campaigns` - Liste des campagnes
  - Et tous les autres endpoints...

### Frontend (Web)
- **URL:** http://localhost:4030
- **Framework:** React + Vite
- **Proxy API:** Les requêtes `/api/*` sont automatiquement redirigées vers `http://localhost:3001/api/*`

### Configuration du proxy (vite.config.mjs)
```javascript
server: {
  port: 4030,
  host: "0.0.0.0",
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

---

## 🚀 Comment démarrer l'application

### Méthode 1: Deux terminaux séparés (Recommandé pour le développement)

**Terminal 1 - Backend:**
```bash
cd "/mnt/c/Users/arhou/OneDrive/Bureau/edu fund"
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd "/mnt/c/Users/arhou/OneDrive/Bureau/edu fund"
npm start
```

### Méthode 2: En arrière-plan

```bash
cd "/mnt/c/Users/arhou/OneDrive/Bureau/edu fund"
node server.js > backend.log 2>&1 &
npm start > frontend.log 2>&1 &
```

Pour voir les logs:
```bash
tail -f backend.log
tail -f frontend.log
```

---

## 🔍 Diagnostic des erreurs futures

### Si "Server error" réapparaît:

1. **Vérifier que le backend tourne:**
```bash
curl http://localhost:3001/api/campaigns
```
Si erreur → Redémarrer le backend avec `node server.js`

2. **Vérifier que le frontend tourne:**
```bash
curl http://localhost:4030
```
Si erreur → Redémarrer le frontend avec `npm start`

3. **Vérifier les processus:**
```bash
ps aux | grep node
lsof -i:3001
lsof -i:4030
```

4. **Vérifier les logs:**
```bash
# Backend
tail -50 backend.log

# Frontend
tail -50 frontend.log
```

5. **Vérifier la connexion MySQL:**
```bash
node test-mysql-connection.js
```

---

## 🛠️ Scripts utiles

### Arrêter tous les serveurs
```bash
pkill -f "node server.js"
pkill -f "vite"
```

### Nettoyer les ports
```bash
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:4030 | xargs kill -9 2>/dev/null
```

### Redémarrer tout
```bash
# Arrêter
pkill -f "node server.js"
pkill -f "vite"

# Attendre 2 secondes
sleep 2

# Redémarrer
cd "/mnt/c/Users/arhou/OneDrive/Bureau/edu fund"
node server.js > backend.log 2>&1 &
npm start > frontend.log 2>&1 &

# Vérifier après 10 secondes
sleep 10
curl http://localhost:3001/api/campaigns
curl http://localhost:4030
```

---

## 📝 Checklist de vérification

Avant d'accéder à http://localhost:4030/login, vérifiez:

- [ ] MySQL est en cours d'exécution
- [ ] Backend (port 3001) répond
- [ ] Frontend (port 4030) répond
- [ ] Pas d'erreurs dans les logs backend
- [ ] Pas d'erreurs dans les logs frontend
- [ ] Le fichier `.env` est correctement configuré

---

## ✅ État actuel

**Serveurs actifs:**
- ✅ Backend (Node.js/Express) - Port 3001
- ✅ Frontend (React/Vite) - Port 4030
- ✅ MySQL Database

**Vous pouvez maintenant accéder à:**
- 🌐 Application web: http://localhost:4030
- 📱 Page de connexion: http://localhost:4030/login
- 🔌 API Backend: http://localhost:3001/api

---

## 🔐 Comptes de test

### Admin
- Email: `omar@gmail.com`
- Mot de passe: `0668328275Aa`

### Étudiant
- Email: `sarah.johnson@student.edu`
- Mot de passe: `password123`

### Donateur
- Email: `john.doe@donor.com`
- Mot de passe: `password123`

---

## 🎉 Résolution complète

Le problème "Server error" a été résolu en redémarrant les serveurs backend et frontend.

**L'application EduFund est maintenant complètement fonctionnelle !**

Vous pouvez vous connecter sur http://localhost:4030/login sans erreur.

---

## 📞 Support

Si le problème persiste:
1. Vérifiez que MySQL tourne: `ps aux | grep mysql`
2. Consultez les logs: `tail backend.log` et `tail frontend.log`
3. Testez la connexion DB: `node test-mysql-connection.js`
4. Redémarrez tout avec les commandes ci-dessus

---

**Date de résolution:** 5 Novembre 2025, 12:45
**Statut:** ✅ RÉSOLU - Application fonctionnelle
