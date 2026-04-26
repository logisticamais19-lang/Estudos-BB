#!/bin/bash
echo "🔄 Sincronizando frontend para raiz..."
cp frontend/app.html app.html
cp frontend/index.html index.html
echo "📦 Fazendo commit e push..."
git add app.html index.html
git commit -m "sync: atualiza raiz com frontend"
git push origin main
firebase deploy --only hosting
echo "✅ Deploy completo!"
