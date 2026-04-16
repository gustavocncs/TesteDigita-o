import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

const textosPorDificuldade = {
  facil: [
    'O estudo constante melhora a digitação e aumenta a confiança ao escrever textos com mais rapidez.',
    'Treinar todos os dias ajuda a ganhar velocidade, precisão e familiaridade com o teclado.',
    'Projetos simples são ótimos para praticar lógica, interface e eventos em aplicações web.'
  ],
  medio: [
    'A prática frequente da digitação contribui diretamente para o aumento da produtividade, da precisão e da agilidade em tarefas do dia a dia.',
    'Construir aplicações interativas com React é uma excelente forma de desenvolver raciocínio lógico, organização de componentes e controle de estados.',
    'Uma interface bem planejada melhora a experiência do usuário, facilita a navegação e valoriza bastante um projeto de portfólio.'
  ],
  dificil: [
    'A transformação digital exige profissionais capazes de conciliar raciocínio analítico, adaptabilidade técnica e domínio de ferramentas modernas para solucionar problemas complexos com eficiência.',
    'Ao desenvolver aplicações web robustas, é essencial estruturar bem os componentes, otimizar a renderização e garantir uma experiência fluida, acessível e responsiva ao usuário final.',
    'Projetos práticos desafiadores fortalecem o portfólio porque demonstram não apenas conhecimento técnico, mas também atenção aos detalhes, consistência visual e capacidade de implementação.'
  ]
}

function obterTextoAleatorio(dificuldade) {
  const lista = textosPorDificuldade[dificuldade]
  const indice = Math.floor(Math.random() * lista.length)
  return lista[indice]
}

function obterMensagemDesempenho(ppm, precisao, erros) {
  if (ppm >= 70 && precisao >= 95) {
    return {
      titulo: 'Desempenho excelente!',
      mensagem: `Você alcançou ${ppm} PPM, com ${precisao}% de precisão e ${erros} erro(s). Resultado de alto nível.`
    }
  }

  if (ppm >= 45 && precisao >= 90) {
    return {
      titulo: 'Ótimo resultado!',
      mensagem: `Você fez ${ppm} PPM, com ${precisao}% de precisão e ${erros} erro(s). Está muito bem.`
    }
  }

  if (ppm >= 25) {
    return {
      titulo: 'Bom trabalho!',
      mensagem: `Você marcou ${ppm} PPM, com ${precisao}% de precisão e ${erros} erro(s). Continue praticando para evoluir ainda mais.`
    }
  }

  return {
    titulo: 'Continue treinando!',
    mensagem: `Você terminou com ${ppm} PPM, ${precisao}% de precisão e ${erros} erro(s). A prática constante vai melhorar seu desempenho.`
  }
}

const estadoInicialResultado = {
  titulo: '',
  mensagem: '',
  ppm: 0,
  precisao: 100,
  erros: 0,
  caracteresCorretos: 0,
  totalDigitado: 0,
  dificuldade: 'Difícil',
  modo: 'Cronometrado (60s)',
  tempoGasto: 0
}

function App() {
  const [dificuldade, setDificuldade] = useState('dificil')
  const [modo, setModo] = useState('tempo')
  const [tempoSelecionado] = useState(60)
  const [tempoRestante, setTempoRestante] = useState(60)
  const [textoAtual, setTextoAtual] = useState(() => obterTextoAleatorio('dificil'))
  const [textoDigitado, setTextoDigitado] = useState('')
  const [iniciado, setIniciado] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [resultado, setResultado] = useState(estadoInicialResultado)
  const [recorde, setRecorde] = useState(() => {
    return Number(localStorage.getItem('recorde_ppm')) || 0
  })

  const inputRef = useRef(null)

  const totalDigitado = textoDigitado.length

  const { caracteresCorretos, quantidadeErros } = useMemo(() => {
    let corretos = 0
    let erros = 0

    for (let i = 0; i < textoDigitado.length; i++) {
      if (textoDigitado[i] === textoAtual[i]) {
        corretos++
      } else {
        erros++
      }
    }

    return {
      caracteresCorretos: corretos,
      quantidadeErros: erros
    }
  }, [textoDigitado, textoAtual])

  const segundosPassados = tempoSelecionado - tempoRestante
  const minutosPassados = segundosPassados > 0 ? segundosPassados / 60 : 1 / 60
  const ppm = Math.max(0, Math.round((caracteresCorretos / 5) / minutosPassados))
  const precisao = totalDigitado > 0 ? Math.round((caracteresCorretos / totalDigitado) * 100) : 100

  useEffect(() => {
    if (!iniciado || finalizado) return

    const intervalo = setInterval(() => {
      setTempoRestante((anterior) => {
        if (anterior <= 1) {
          clearInterval(intervalo)
          return 0
        }
        return anterior - 1
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [iniciado, finalizado])

  useEffect(() => {
    if (tempoRestante === 0 && !finalizado) {
      encerrarTeste()
    }
  }, [tempoRestante, finalizado])

  function salvarRecorde(novoPpm) {
    if (novoPpm > recorde) {
      setRecorde(novoPpm)
      localStorage.setItem('recorde_ppm', String(novoPpm))
    }
  }

  function encerrarTeste(
    ppmFinal = ppm,
    precisaoFinal = precisao,
    errosFinais = quantidadeErros,
    corretosFinais = caracteresCorretos,
    totalFinal = totalDigitado
  ) {
    setFinalizado(true)

    const feedback = obterMensagemDesempenho(ppmFinal, precisaoFinal, errosFinais)
    const tempoGasto = tempoSelecionado - tempoRestante

    setResultado({
      titulo: feedback.titulo,
      mensagem: feedback.mensagem,
      ppm: ppmFinal,
      precisao: precisaoFinal,
      erros: errosFinais,
      caracteresCorretos: corretosFinais,
      totalDigitado: totalFinal,
      dificuldade:
        dificuldade === 'facil'
          ? 'Fácil'
          : dificuldade === 'medio'
          ? 'Médio'
          : 'Difícil',
      modo: modo === 'tempo' ? 'Cronometrado (60s)' : 'Passagem',
      tempoGasto
    })

    salvarRecorde(ppmFinal)
  }

  function reiniciarTeste(trocarTexto = false, novaDificuldade = dificuldade) {
    setIniciado(false)
    setFinalizado(false)
    setTextoDigitado('')
    setTempoRestante(tempoSelecionado)
    setResultado(estadoInicialResultado)

    if (trocarTexto) {
      setTextoAtual(obterTextoAleatorio(novaDificuldade))
    }

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  function alterarDificuldade(novaDificuldade) {
    setDificuldade(novaDificuldade)
    setTextoAtual(obterTextoAleatorio(novaDificuldade))
    setIniciado(false)
    setFinalizado(false)
    setTextoDigitado('')
    setTempoRestante(tempoSelecionado)
    setResultado(estadoInicialResultado)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  function alterarModo(novoModo) {
    setModo(novoModo)
    setIniciado(false)
    setFinalizado(false)
    setTextoDigitado('')
    setTempoRestante(tempoSelecionado)
    setResultado(estadoInicialResultado)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  function lidarComMudanca(event) {
    if (finalizado) return

    const valor = event.target.value

    if (!iniciado && valor.length > 0) {
      setIniciado(true)
    }

    setTextoDigitado(valor)

    if (valor.length === textoAtual.length) {
      const corretos = valor
        .split('')
        .filter((char, index) => char === textoAtual[index]).length

      const erros = valor.length - corretos
      const precisaoFinal =
        valor.length > 0 ? Math.round((corretos / valor.length) * 100) : 100

      const segundosGastos = tempoSelecionado - tempoRestante
      const minutos = segundosGastos > 0 ? segundosGastos / 60 : 1 / 60
      const ppmFinal = Math.max(0, Math.round((corretos / 5) / minutos))

      encerrarTeste(ppmFinal, precisaoFinal, erros, corretos, valor.length)
    }
  }

  if (finalizado) {
    return (
      <main className="app final-app">
        <section className="tela-final">
          <div className="resultado-topo">
            <span className="resultado-chip">Teste concluído</span>
            <h1>{resultado.titulo}</h1>
            <p>{resultado.mensagem}</p>
          </div>

          <div className="grid-status">
            <article className="card-status">
              <span>PPM</span>
              <strong>{resultado.ppm}</strong>
            </article>

            <article className="card-status">
              <span>Precisão</span>
              <strong>{resultado.precisao}%</strong>
            </article>

            <article className="card-status">
              <span>Erros</span>
              <strong>{resultado.erros}</strong>
            </article>

            <article className="card-status">
              <span>Caracteres corretos</span>
              <strong>{resultado.caracteresCorretos}</strong>
            </article>

            <article className="card-status">
              <span>Total digitado</span>
              <strong>{resultado.totalDigitado}</strong>
            </article>

            <article className="card-status">
              <span>Tempo gasto</span>
              <strong>{resultado.tempoGasto}s</strong>
            </article>

            <article className="card-status">
              <span>Dificuldade</span>
              <strong>{resultado.dificuldade}</strong>
            </article>

            <article className="card-status">
              <span>Modo</span>
              <strong>{resultado.modo}</strong>
            </article>

            <article className="card-status destaque">
              <span>Melhor marca</span>
              <strong>{recorde} PPM</strong>
            </article>
          </div>

          <div className="acoes-finais">
            <button className="botao-principal suave" onClick={() => reiniciarTeste(false)}>
              Tentar novamente
            </button>
            <button className="botao-secundario suave" onClick={() => reiniciarTeste(true)}>
              Novo texto
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="topo">
        <div className="branding">
          <div className="icone">⌨️</div>
          <div>
            <h1>Teste de Velocidade de Digitação</h1>
            <p>Digite o mais rápido que puder em português</p>
          </div>
        </div>

        <div className="recorde">
          <span>🏆</span>
          <p>Melhor marca: {recorde} PPM</p>
        </div>
      </header>

      <section className="barra-informacoes">
        <div className="metricas">
          <div className="metrica">
            <span>PPM:</span>
            <strong>{ppm}</strong>
          </div>

          <div className="separador" />

          <div className="metrica">
            <span>Precisão:</span>
            <strong className="precisao">{precisao}%</strong>
          </div>

          <div className="separador" />

          <div className="metrica">
            <span>Tempo:</span>
            <strong className="tempo">0:{String(tempoRestante).padStart(2, '0')}</strong>
          </div>
        </div>

        <div className="controles">
          <div className="grupo-controle">
            <span className="rotulo">Dificuldade:</span>
            <div className="botoes-opcao">
              <button
                className={dificuldade === 'facil' ? 'opcao ativa suave' : 'opcao suave'}
                onClick={() => alterarDificuldade('facil')}
              >
                Fácil
              </button>
              <button
                className={dificuldade === 'medio' ? 'opcao ativa suave' : 'opcao suave'}
                onClick={() => alterarDificuldade('medio')}
              >
                Médio
              </button>
              <button
                className={dificuldade === 'dificil' ? 'opcao ativa suave' : 'opcao suave'}
                onClick={() => alterarDificuldade('dificil')}
              >
                Difícil
              </button>
            </div>
          </div>

          <div className="grupo-controle">
            <span className="rotulo">Modo:</span>
            <div className="botoes-opcao">
              <button
                className={modo === 'tempo' ? 'opcao ativa suave' : 'opcao suave'}
                onClick={() => alterarModo('tempo')}
              >
                Cronometrado (60s)
              </button>
              <button
                className={modo === 'passagem' ? 'opcao ativa suave' : 'opcao suave'}
                onClick={() => alterarModo('passagem')}
              >
                Passagem
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="area-texto">
        <div className="texto-exibido">
          {textoAtual.split('').map((char, index) => {
            let classe = 'char'

            if (textoDigitado[index] == null) {
              if (index === textoDigitado.length) {
                classe += ' atual'
              }
            } else if (textoDigitado[index] === char) {
              classe += ' correto'
            } else {
              classe += ' incorreto'
            }

            return (
              <span key={index} className={classe}>
                {char}
              </span>
            )
          })}
        </div>

        <textarea
          ref={inputRef}
          className="input-digitacao"
          placeholder="Clique aqui e comece a digitar..."
          value={textoDigitado}
          onChange={lidarComMudanca}
          disabled={finalizado}
          spellCheck="false"
        />
      </section>

      <section className="acoes-inferiores">
        <button className="botao-principal suave" onClick={() => reiniciarTeste(false)}>
          Reiniciar
        </button>
        <button className="botao-secundario suave" onClick={() => reiniciarTeste(true)}>
          Novo texto
        </button>
      </section>
    </main>
  )
}

export default App