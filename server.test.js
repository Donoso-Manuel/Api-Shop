const request = require('supertest');
const { app, pool, testDBSetup } = require('./server');

describe('Pruebas de Endpoints de Productos', () => {

    beforeAll(async () => {
        await testDBSetup(pool);
    });

    afterEach(async () => {
        await pool.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');
        await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'); // Limpia users si es necesario
    });

    it('GET /products debe retornar un código de estado 200 y una lista de productos', 
        async () => { // Prueba para GET /products
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toEqual(200); //código de estado 201 (Creado/Éxito)
            expect(Array.isArray(res.body)).toBe(true); // Verifica si la respuesta es un array (lista de productos)
    });

    it('POST /products debe retornar un código de estado 200 cuando el producto se crea exitosamente', async () => {
        const newProduct = {
            name: "Producto de Prueba",
            description: "Descripción de Prueba",
            price: 100,
            stock: 10,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEAbv1Naw90jDTHfBkCkcQAqurxL_aFIrwCw&s" // URL de imagen válida 
        };
        const res = await request(app)
            .post('/api/products')
            .send(newProduct);
        expect(res.statusCode).toEqual(200); //código 201 (Creado)
        expect(res.body.message).toBe("Producto creado con éxito");
    });

    it('POST /products debe retornar un código de estado 400 cuando el formato de la URL de la imagen es inválido', async () => {
        const invalidProduct = {
            name: "Producto Inválido",
            description: "Descripción Inválida",
            price: 50,
            stock: 5,
            image: "invalid-url" //URL de imagen inválido
        };
        const res = await request(app)
            .post('/api/products')
            .send(invalidProduct);
        expect(res.statusCode).toEqual(400); // Espera código de estado 400 (Solicitud Incorrecta)
        expect(res.body.message).toBe("La URL no corresponde a un formato de imagen válido (jpg, jpeg, png, gif)."); // Verifica el mensaje de error específico
    });

    it('GET /products/:id debe retornar un código de estado 200 para un producto existente', async () => {
        const productId = 1; // Asumiendo que existe un producto con ID 1 (podrías necesitar sembrar tu BD de prueba)
        const res = await request(app).get(`/api/products/${productId}`);
        expect(res.statusCode).toEqual(200); // Espera código de estado 200 (Éxito)
        expect(res.body).toBeInstanceOf(Object); // Verifica si el cuerpo de la respuesta es un objeto (detalles del producto)
    });

    it('GET /products/:id debe retornar un código de estado 404 para un producto no existente (o error)', async () => {
        const productId = 9999; // NO existe producto con ID 9999
        const res = await request(app).get(`/api/products/${productId}`);
        expect(res.statusCode).toEqual(404); 
        expect(res.body.message).toContain("producto no encontrado"); // mensaje de error 
    });

});

describe('Pruebas de Endpoints de Usuario', () => {

    afterEach(async () => {
        await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
        // Limpia otras tablas relacionadas con usuarios si es necesario
    });

    it('POST /login debe retornar un código de estado 200 y un token para credenciales válidas', async () => {
        const validLogin = {
            correo: "test@example.com", 
            password: "password123"  
        };
        const res = await request(app)
            .post('/api/login')
            .send(validLogin);
        expect(res.statusCode).toEqual(200); // Espera código de estado 200 (Éxito)
        expect(res.body.token).toBeDefined(); // Verifica si la respuesta contiene un token
    });

    it('POST /login debe retornar un código de estado 401 para credenciales inválidas', async () => {
        const invalidLogin = {
            correo: "invalid@example.com",
            password: "wrongpassword"
        };
        const res = await request(app)
            .post('/api/login')
            .send(invalidLogin);
        expect(res.statusCode).toEqual(401); // Espera código de estado 401 (No autorizado)
        expect(res.body.message).toBe("❌ Credenciales incorrectas"); // Verifica el mensaje de error
    });

    it('GET /users debe retornar un código de estado 200 y una lista de usuarios', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toEqual(200); // Espera código de estado 200 (Éxito)
        expect(Array.isArray(res.body)).toBe(true); // Verifica si el cuerpo de la respuesta es un array (lista de usuarios)
    });

    it('POST /users debe retornar un código de estado 201 cuando el usuario es creado', async () => {
        const newUser = {
            nombre: "Usuario de Prueba",
            correo: "test.user.create@example.com",
            password: "password123",
            direccion: "Dirección de Prueba",
            ciudad: "Ciudad de Prueba",
            telefono: "1234567890"
        };
        const res = await request(app)
            .post('/api/users')
            .send(newUser);
        expect(res.statusCode).toEqual(201); // código de estado 201 (Creado)
        expect(res.body.message).toContain("Usuario creado con rol"); // El mensaje depende del rol del usuario
    });

    it('POST /users debe retornar un código de estado 500 cuando falta el correo', async () => {
        const invalidUser = {
            nombre: "Usuario Inválido",
            password: "password123",
            direccion: "Dirección de Prueba",
            ciudad: "Ciudad de Prueba",
            telefono: "1234567890"
            // correo está ausente
        };
        const res = await request(app)
            .post('/api/users')
            .send(invalidUser);
        expect(res.statusCode).toEqual(500); 
    });
    });
