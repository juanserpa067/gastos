# Registro de Gastos — proyecto para Vercel

## Qué contiene
- `index.html` — la app (igual a la demo, pero ahora llama a tu propia función en vez de a Anthropic directo)
- `api/clasificar.js` — la función serverless que llama a Claude de forma segura con tu llave

## Pasos para publicarlo

### 1. Sube esto a un repositorio de GitHub
Opción sin usar terminal (más fácil):
1. Ve a github.com → **New repository** (ej. nombre: `gastos-demo`)
2. Déjalo público o privado, sin agregar README
3. Una vez creado, en la página del repo busca el link "uploading an existing file"
4. Arrastra los 3 archivos de esta carpeta (`index.html`, la carpeta `api` completa, y `README.md`)
5. Commit changes

### 2. Conecta ese repo en Vercel
1. En la pantalla de "New Project" donde ya estás, clic en **GitHub**
2. Autoriza a Vercel a ver tus repos si te lo pide
3. Busca `gastos-demo` (o el nombre que le pusiste) y clic en **Import**
4. NO le cambies nada en la configuración de build — Vercel detecta solo que es un proyecto estático + funciones API

### 3. Agrega tu llave de API como variable de entorno (paso crítico)
Antes de hacer clic en "Deploy", o después en Settings → Environment Variables:
- Name: `ANTHROPIC_API_KEY`
- Value: tu llave de console.anthropic.com (empieza con `sk-ant-`)

Sin este paso, la función no va a poder llamar a Claude.

### 4. Deploy
Clic en **Deploy**. Vercel te da un link público (algo como `gastos-demo.vercel.app`) que ya funciona en cualquier navegador o celular — sin depender del chat de Claude.

## Nota sobre costos
Cada foto o PDF que se sube hace una llamada pagada a la API de Anthropic. Antes de mandar el link a varios amigos, ten presente cuánto crédito tienes cargado en console.anthropic.com.
