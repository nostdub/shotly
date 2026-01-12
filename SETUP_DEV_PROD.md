# Guide Dev/Prod pour Non-Devs 🚀

## C'est quoi Dev vs Prod ?

**DEV (Développement)** = Votre brouillon

- Sur votre PC
- Vous testez, changez, cassez des trucs
- Personne d'autre ne voit

**PROD (Production)** = La version en direct

- Sur votrendd.com
- Les vrais utilisateurs utilisent
- Doit être stable et rapide

---

## 🎯 Ce qu'il faut comprendre

```
Votre PC (DEV)
├─ Fichiers .env avec TOUS les secrets
├─ Vous testez localement
└─ Rien n'est publique

GitHub (entrepôt du code)
├─ Tous les fichiers du code
├─ SANS les fichiers .env (secrets protégés)
└─ C'est la source de vérité

Vercel (serveur PROD en direct)
├─ Récupère le code de GitHub
├─ Utilise des variables d'env depuis l'interface Vercel
├─ Déploie votrendd.com
└─ Les utilisateurs voient ça

Convex (base de données)
├─ DEV = base de test (pour développer)
└─ PROD = base réelle (données clients)

Backblaze (stockage fichiers)
├─ DEV = bucket test (pour développer)
└─ PROD = bucket réel (fichiers clients)
```

---

## ✅ CHECKLIST : Qu'est-ce que je dois faire ?

### **ÉTAPE 1 : Préparer les fichiers locaux (sur votre PC)**

- [ ] S'assurer que `.env` et `.env.local` ont vos vrais secrets
- [ ] Créer `.env.example` (template sans secrets) → À PUSH
- [ ] Vérifier `.gitignore` contient `.env` et `.env.local` → À PUSH

**Résultat** : Vos secrets restent sur votre PC, jamais sur GitHub

---

### **ÉTAPE 2 : Créer GitHub branches**

- [ ] Créer branche `main` (production) → Déploie votrendd.com
- [ ] Créer branche `develop` (staging) → Déploie dev.votrendd.com
- [ ] Push le code (SANS .env) sur GitHub

**Résultat** : Votre code est sauvegardé et versionné

---

### **ÉTAPE 3 : Setup Convex (backend)**

- [ ] Créer 1er projet Convex = DEV
  - Base de données de test
  - Utilisée en développement local
- [ ] Créer 2e projet Convex = PROD
  - Base de données réelle
  - Pour les vrais utilisateurs

**Résultat** : Données séparées dev/prod

---

### **ÉTAPE 4 : Setup Backblaze (stockage)**

- [ ] Créer 1er bucket = DEV (fichiers test)
- [ ] Créer 2e bucket = PROD (fichiers clients)
- [ ] Créer 2 sets de credentials (API keys)

**Résultat** : Fichiers séparés dev/prod

---

### **ÉTAPE 5 : Setup Vercel (frontend en direct)**

- [ ] Créer 1 projet Vercel (ou 1 projet avec 2 branches)
- [ ] Connecter à GitHub (autorise Vercel à voir vos branches)
- [ ] Ajouter les variables d'environnement PROD dans Vercel
  ```
  VITE_CONVEX_URL = URL du projet Convex PROD
  VITE_API_URL = https://votrendd.com
  VITE_BACKBLAZE_KEY = clé Backblaze PROD
  ```

**Résultat** : votrendd.com est en direct et auto-déploie quand vous pushez

---

## 📋 Qui utilise quoi

| Contexte           | Système        | Variables                     | Fichiers              |
| ------------------ | -------------- | ----------------------------- | --------------------- |
| **Vous sur PC**    | Dev local      | `.env.local` (secrets)        | Sur votre disque      |
| **Collaborateurs** | Dev local      | `.env.local` + `.env.example` | Sur leur disque       |
| **GitHub**         | Stockage code  | `.env.example` (template)     | Push sûr              |
| **Vercel/prod**    | Serveur direct | Variables Vercel UI           | Nulle part (injected) |

---

## 🔄 Workflow quotidien

```
1. Vous travaillez sur votre PC (branche develop)
   └─ Utilise `.env.local` avec vos secrets

2. C'est bon? Vous pushez sur GitHub (branche develop)
   └─ GitHub reçoit SANS les secrets

3. Vercel voit le push
   └─ Build automatiquement avec variables PROD

4. Changement en direct sur dev.votrendd.com
   └─ Les changements sont testables

5. C'est stable? PR develop → main
   └─ Merge dans main

6. Vercel re-déploie votrendd.com (PROD)
   └─ Les utilisateurs voient le changement
```

---

## 🚨 IMPORTANT - Les secrets

### **JAMAIS sur GitHub**

- ❌ `GOOGLE_CLIENT_SECRET`
- ❌ `JWT_PRIVATE_KEY`
- ❌ `REPLICATE_API_TOKEN`
- ❌ `BACKBLAZE_CREDENTIALS`

### **OÙ ils doivent être**

- ✅ `.env.local` sur votre PC (dev)
- ✅ Vercel UI Settings (prod)
- ✅ `.env.example` (template SANS secrets)

---

## 📚 Fichiers à créer/modifier

### **À MODIFIER** : `.gitignore`

```
Ajouter:
.env
.env.local
.env.production.local
convex/.env
convex/.env.local
```

### **À CRÉER** : `.env.example`

```
# Example file - copy to .env.local and fill with YOUR values
VITE_CONVEX_URL=http://127.0.0.1:3210
CONVEX_DEPLOYMENT=anonymous:anonymous-frontend
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REPLICATE_API_TOKEN=your_replicate_token
```

### **À CRÉER** : `convex/.env.example`

```
# Convex backend example
CONVEX_DEPLOYMENT=your-deployment-id
```

---

## ✨ Résumé en 3 phrases

1. **Les secrets resteront sur votre PC** grâce à `.gitignore`
2. **Vercel récupère les variables** depuis son interface (Settings)
3. **GitHub n'aura jamais vos vrais secrets**, juste le code propre

Vous êtes safe ! 🔒
