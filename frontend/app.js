document.getElementById('gastoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const descripcion = document.getElementById('descripcion').value;
    const cantidad = document.getElementById('cantidad').value;
    const categoria = document.getElementById('categoria').value;
    const fecha = document.getElementById('fecha').value;

    const gasto = { descripcion, cantidad, categoria, fecha };

    await fetch(`${process.env.API_URL}/api/gastos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gasto)
    });

    document.getElementById('gastoForm').reset();
    cargarGastos();
    cargarResumen();
});

async function cargarGastos() {
    const response = await fetch(`${process.env.API_URL}/api/gastos`);
    const gastos = await response.json();
    const gastosList = document.getElementById('gastosList');
    gastosList.innerHTML = '';
    gastos.forEach(gasto => {
        const li = document.createElement('li');
        li.textContent = `${gasto.cantidad} - ${gasto.categoria} - ${gasto.fecha}`;
        gastosList.appendChild(li);
    });
}

async function cargarResumen() {
    const response = await fetch(`${process.env.API_URL}/api/resumen`);
    const resumen = await response.json();
    const resumenList = document.getElementById('resumenList');
    resumenList.innerHTML = '';
    resumen.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item._id}: Total - ${item.total}, Cantidad - ${item.count}`;
        resumenList.appendChild(li);
    });
}

// Cargar gastos y resumen al inicio
cargarGastos();
cargarResumen();
