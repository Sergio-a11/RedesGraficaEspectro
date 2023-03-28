document.querySelector('#form1').addEventListener('submit', (e) => {
  e.preventDefault(); //no reeenvio
  data = Object.fromEntries(new FormData(e.target));
  grafica(data);
  //console.log(calcularPire(data));

  console.log(data);
  console.log(data['varAnchoBanda']);
});

function grafica(data) {
  console.log(JSON.stringify(data));
  const ctx = document.getElementById('myChart');

  let potencia = data.unidadPotencia;
  if (potencia === 'w')
    potencia = convertirDbwToDbm(convertirWattsToDbw(data.varPotencia));
  else if (potencia === 'dbw') potencia = convertirDbwToDbm(data.varPotencia);
  else potencia = data.varPotencia;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [
        data.varFrecuencia - Number(data.varAnchoBanda / 2) * 2,
        data.varFrecuencia - Number(data.varAnchoBanda / 2),
        data.varFrecuencia,
        Number(data.varFrecuencia) + Number(data.varAnchoBanda / 2),
        Number(data.varFrecuencia) + Number(data.varAnchoBanda / 2) * 2,
      ],
      datasets: [
        {
          data: [
            -100,
            -100,
            (Number(potencia) + Number(data.varAntenaSatelite)).toFixed(2),
            -100,
            -100,
          ],
          pointStyle: 'circle',
          pointRadius: 10,
          pointHoverRadius: 15,
          borderColor: 'rgba(255,0,0)',
          label: 'Espectro',
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Grafica de espectro',
        },
      },
    },
  });

  //comienzo de segundo punto
  verificarEnlace(data, potencia);
  //comienzo de tercer punto
  calcularAmplificacionFaltante(data, potencia);
}

function convertirWattsToDbw(value) {
  return (10 * Math.log10(value)).toFixed(2);
}

function convertirDbwToDbm(value) {
  return (30 + Number(value)).toFixed(2);
}

function convertirDbmToWatts(value) {
  return (Math.pow(10, value / 10) / 1000).toFixed(2);
}

function calcularPEL(distancia, frecuencia) {
  return (
    32.4 +
    (20 * Math.log10(Number(distancia)) + 20 * Math.log10(Number(frecuencia)))
  ).toFixed(2);
}

function calcularPire(data, potencia) {
  return Number(potencia) + Number(data.varAntenaSatelite);
}

function calcularPELGrafico(data, potencia) {
  return (
    calcularPire(data, potencia) +
    Number(data.varAntenaReceptor) +
    Number(data.varUmbral * -1) -
    20
  );
}

function verificarEnlace(data, potencia) {
  let pelGrafico = calcularPELGrafico(data, potencia);
  let PelTransmission = calcularPEL(data.varOrbita, data.varFrecuencia);
  let verificarEnlace = document.getElementById('verificarEnlace');
  verificarEnlace.innerHTML = `
  <br>2. El valor maximo de PEL que puede perder la transmisión es: <b>${pelGrafico}</b>
  El valor de perdida de la transmisión actual es: <b>${PelTransmission}</b>
  En tanto se concluye que ${
    pelGrafico < PelTransmission
      ? '<b style="color:red;">No</b> se puede establecer enlace'
      : '<b style="color:red;">Si</b> se puede establecer enlace'
  }`;
}

function calcularAmplificacionFaltante(data, potencia) {
  let pelGrafico = calcularPELGrafico(data, potencia);
  let PelTransmission = calcularPEL(36000, data.varFrecuencia);
  let verificarEnlace = document.getElementById('amplificaciónFaltante');
  verificarEnlace.innerHTML = `
  <br>3. El valor maximo de PEL que puede perder la transmisión es: <b>${pelGrafico}</b>
  A una distancia de transmision de <b>36000</b> km. El valor de perdida de la transmisión es: <b>${PelTransmission}</b>
  En tanto se concluye que hace falta un amplicador de minimo <b style="color:red;">${Math.abs(
    PelTransmission - pelGrafico
  ).toFixed(2)}</b> dB`;
  //console.log(calcularPEL(36000, 14500));
}

//console.log(convertirDbwToDbm(convertirWattsToDbw(2.5)));

//console.log(convertirDbmToWatts(convertirDbwToDbm(convertirWattsToDbm(2.5))));

//console.log(calcularPEL(1350, 14500));
//console.log(calcularPire());
