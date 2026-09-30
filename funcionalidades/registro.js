/* ============================================================
   REGISTRO.JS
   Tela de acompanhamento / histórico geral

   Utiliza os dados armazenados pelo:
   - cadastro.html
   - prontuario.html

   Chave utilizada:
   enfermagem_pacientes
============================================================ */


/* ============================================================
   CONFIGURAÇÃO
============================================================ */

const CHAVE_PACIENTES = "enfermagem_pacientes";

let registrosExibidos = [];

let paginaAtual = 1;

const REGISTROS_POR_PAGINA = 10;


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarTela();

    }
);


/* ============================================================
   INICIALIZAR TELA
============================================================ */

function inicializarTela() {

    carregarRegistros();

    configurarPesquisa();

    configurarFiltros();

    configurarBotoes();

}


/* ============================================================
   OBTER PACIENTES
============================================================ */

function obterPacientes() {

    const dados =
        localStorage.getItem(
            CHAVE_PACIENTES
        );


    if (!dados) {

        return [];

    }


    try {

        const pacientes =
            JSON.parse(dados);


        if (
            !Array.isArray(pacientes)
        ) {

            return [];

        }


        return pacientes;

    } catch (erro) {

        console.error(
            "Erro ao carregar pacientes:",
            erro
        );

        return [];

    }

}


/* ============================================================
   SALVAR PACIENTES
============================================================ */

function salvarPacientes(
    pacientes
) {

    localStorage.setItem(
        CHAVE_PACIENTES,
        JSON.stringify(pacientes)
    );

}


/* ============================================================
   CARREGAR TODOS OS REGISTROS
============================================================ */

function carregarRegistros() {

    const pacientes =
        obterPacientes();


    registrosExibidos = [];


    pacientes.forEach(
        paciente => {

            const registros =
                Array.isArray(
                    paciente.registros
                )
                    ? paciente.registros
                    : [];


            registros.forEach(
                registro => {

                    registrosExibidos.push({

                        paciente:
                            paciente,

                        registro:
                            registro

                    });

                }
            );

        }
    );


    // Mais recentes primeiro

    registrosExibidos.sort(
        (
            a,
            b
        ) => {

            const dataA =
                new Date(
                    a.registro.dataRegistro || 0
                );

            const dataB =
                new Date(
                    b.registro.dataRegistro || 0
                );


            return dataB - dataA;

        }
    );


    atualizarResumo();

    aplicarFiltros();

}


/* ============================================================
   ELEMENTOS DA TELA
============================================================ */

function elemento(
    id
) {

    return document.getElementById(
        id
    );

}


/* ============================================================
   CONFIGURAR PESQUISA
============================================================ */

function configurarPesquisa() {

    const campoPesquisa =
        elemento(
            "campoPesquisa"
        );


    if (!campoPesquisa) {

        return;

    }


    campoPesquisa.addEventListener(
        "input",
        () => {

            paginaAtual = 1;

            aplicarFiltros();

        }
    );

}


/* ============================================================
   CONFIGURAR FILTROS
============================================================ */

function configurarFiltros() {

    const filtroTipo =
        elemento(
            "filtroTipo"
        );


    const filtroData =
        elemento(
            "filtroData"
        );


    if (filtroTipo) {

        filtroTipo.addEventListener(
            "change",
            () => {

                paginaAtual = 1;

                aplicarFiltros();

            }
        );

    }


    if (filtroData) {

        filtroData.addEventListener(
            "change",
            () => {

                paginaAtual = 1;

                aplicarFiltros();

            }
        );

    }

}


/* ============================================================
   CONFIGURAR BOTÕES
============================================================ */

function configurarBotoes() {

    const btnLimpar =
        elemento(
            "btnLimparFiltros"
        );


    if (btnLimpar) {

        btnLimpar.addEventListener(
            "click",
            limparFiltros
        );

    }


    const btnAtualizar =
        elemento(
            "btnAtualizar"
        );


    if (btnAtualizar) {

        btnAtualizar.addEventListener(
            "click",
            () => {

                carregarRegistros();

            }
        );

    }


    const btnAnterior =
        elemento(
            "btnPaginaAnterior"
        );


    if (btnAnterior) {

        btnAnterior.addEventListener(
            "click",
            () => {

                if (
                    paginaAtual > 1
                ) {

                    paginaAtual--;

                    renderizarRegistros();

                }

            }
        );

    }


    const btnProxima =
        elemento(
            "btnPaginaProxima"
        );


    if (btnProxima) {

        btnProxima.addEventListener(
            "click",
            () => {

                const totalPaginas =
                    Math.ceil(
                        registrosExibidos.length /
                        REGISTROS_POR_PAGINA
                    );


                if (
                    paginaAtual <
                    totalPaginas
                ) {

                    paginaAtual++;

                    renderizarRegistros();

                }

            }
        );

    }

}


/* ============================================================
   APLICAR FILTROS
============================================================ */

function aplicarFiltros() {

    const campoPesquisa =
        elemento(
            "campoPesquisa"
        );


    const filtroTipo =
        elemento(
            "filtroTipo"
        );


    const filtroData =
        elemento(
            "filtroData"
        );


    const pesquisa =
        campoPesquisa
            ? campoPesquisa.value
                .trim()
                .toLowerCase()
            : "";


    const tipo =
        filtroTipo
            ? filtroTipo.value
            : "";


    const data =
        filtroData
            ? filtroData.value
            : "";


    const todosRegistros =
        obterTodosRegistros();


    registrosExibidos =
        todosRegistros.filter(
            item => {

                const paciente =
                    item.paciente;


                const registro =
                    item.registro;


                /* -------------------------
                   PESQUISA
                ------------------------- */

                if (pesquisa) {

                    const nome =
                        String(
                            paciente.nomeCompleto || ""
                        ).toLowerCase();


                    const prontuario =
                        String(
                            paciente.prontuario || ""
                        ).toLowerCase();


                    const cpf =
                        String(
                            paciente.cpf || ""
                        ).toLowerCase();


                    const textoRegistro =
                        obterTextoRegistro(
                            registro
                        ).toLowerCase();


                    const encontrou =
                        nome.includes(
                            pesquisa
                        ) ||

                        prontuario.includes(
                            pesquisa
                        ) ||

                        cpf.includes(
                            pesquisa
                        ) ||

                        textoRegistro.includes(
                            pesquisa
                        );


                    if (!encontrou) {

                        return false;

                    }

                }


                /* -------------------------
                   FILTRO POR TIPO
                ------------------------- */

                if (tipo) {

                    const tipoRegistro =
                        identificarTipoRegistro(
                            registro
                        );


                    if (
                        tipoRegistro !==
                        tipo
                    ) {

                        return false;

                    }

                }


                /* -------------------------
                   FILTRO POR DATA
                ------------------------- */

                if (data) {

                    if (
                        !registro.dataRegistro
                    ) {

                        return false;

                    }


                    const dataRegistro =
                        new Date(
                            registro.dataRegistro
                        );


                    const dataFiltro =
                        new Date(
                            data + "T00:00:00"
                        );


                    if (
                        dataRegistro
                            .toDateString() !==
                        dataFiltro
                            .toDateString()
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    registrosExibidos.sort(
        (
            a,
            b
        ) => {

            return new Date(
                b.registro.dataRegistro || 0
            ) -
            new Date(
                a.registro.dataRegistro || 0
            );

        }
    );


    renderizarRegistros();

}


/* ============================================================
   OBTER TODOS OS REGISTROS
============================================================ */

function obterTodosRegistros() {

    const pacientes =
        obterPacientes();


    const registros = [];


    pacientes.forEach(
        paciente => {

            const lista =
                Array.isArray(
                    paciente.registros
                )
                    ? paciente.registros
                    : [];


            lista.forEach(
                registro => {

                    registros.push({

                        paciente:
                            paciente,

                        registro:
                            registro

                    });

                }
            );

        }
    );


    return registros;

}


/* ============================================================
   RENDERIZAR REGISTROS
============================================================ */

function renderizarRegistros() {

    const lista =
        elemento(
            "listaRegistros"
        );


    if (!lista) {

        return;

    }


    lista.innerHTML = "";


    const total =
        registrosExibidos.length;


    if (total === 0) {

        lista.innerHTML = `

            <div class="estado-vazio">

                <div class="estado-vazio-icone">
                    ✓
                </div>

                <h3>
                    Nenhum registro encontrado
                </h3>

                <p>
                    Não existem registros que correspondam
                    aos filtros selecionados.
                </p>

            </div>

        `;


        atualizarPaginacao(0);

        return;

    }


    const inicio =
        (
            paginaAtual - 1
        ) *
        REGISTROS_POR_PAGINA;


    const fim =
        inicio +
        REGISTROS_POR_PAGINA;


    const registrosPagina =
        registrosExibidos.slice(
            inicio,
            fim
        );


    registrosPagina.forEach(
        item => {

            const card =
                criarCardRegistro(
                    item.paciente,
                    item.registro
                );


            lista.appendChild(
                card
            );

        }
    );


    atualizarPaginacao(
        total
    );

}


/* ============================================================
   CRIAR CARD DO REGISTRO
============================================================ */

function criarCardRegistro(
    paciente,
    registro
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "card-registro";


    const tipo =
        identificarTipoRegistro(
            registro
        );


    const data =
        formatarDataHora(
            registro.dataRegistro
        );


    const cuidados =
        Array.isArray(
            registro.cuidados
        )
            ? registro.cuidados
            : [];


    const medicamentos =
        Array.isArray(
            registro.medicamentos
        )
            ? registro.medicamentos
            : [];


    const dispositivos =
        Array.isArray(
            registro.dispositivos
        )
            ? registro.dispositivos
            : [];


    const sinais =
        registro.sinaisVitais || {};


    article.innerHTML = `

        <div class="registro-topo">

            <div class="registro-identificacao">

                <div class="registro-icone">
                    ${obterIconeTipo(tipo)}
                </div>

                <div>

                    <span class="registro-tipo">
                        ${escaparHTML(tipo)}
                    </span>

                    <h3>
                        ${escaparHTML(
                            paciente.nomeCompleto ||
                            "Paciente sem nome"
                        )}
                    </h3>

                    <span class="registro-prontuario">
                        Prontuário:
                        ${escaparHTML(
                            paciente.prontuario ||
                            "Não informado"
                        )}
                    </span>

                </div>

            </div>


            <div class="registro-data">

                <span>
                    Registrado em
                </span>

                <strong>
                    ${escaparHTML(data)}
                </strong>

            </div>

        </div>


        <div class="registro-conteudo">

            ${criarResumoCondicao(registro)}

            ${criarResumoSinaisVitais(sinais)}

            ${criarResumoCuidados(cuidados)}

            ${criarResumoMedicamentos(medicamentos)}

            ${criarResumoProcedimento(
                registro.procedimento
            )}

            ${criarResumoFerida(
                registro.ferida
            )}

            ${criarResumoAlimentacao(
                registro.alimentacao
            )}

            ${criarResumoDispositivos(
                dispositivos,
                registro.detalhesDispositivos
            )}

            ${criarResumoIntercorrencia(
                registro.intercorrencia
            )}

            ${criarResumoTexto(
                "Evolução",
                registro.evolucao
            )}

            ${criarResumoTexto(
                "Observações",
                registro.observacoes
            )}

        </div>


        <div class="registro-rodape">

            <button
                type="button"
                class="btn-ver-detalhes"
                data-id="${escaparHTML(
                    registro.id || ""
                )}"
            >
                Ver registro completo
            </button>

        </div>

    `;


    const botao =
        article.querySelector(
            ".btn-ver-detalhes"
        );


    if (botao) {

        botao.addEventListener(
            "click",
            () => {

                abrirRegistroCompleto(
                    paciente,
                    registro
                );

            }
        );

    }


    return article;

}


/* ============================================================
   RESUMO DA CONDIÇÃO
============================================================ */

function criarResumoCondicao(
    registro
) {

    if (
        !registro.condicaoAtual &&
        !registro.nivelConsciencia &&
        !registro.estadoGeral
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Condição atual
            </h4>

            ${
                registro.condicaoAtual
                    ? `
                        <p>
                            ${escaparHTML(
                                registro.condicaoAtual
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                registro.nivelConsciencia
                    ? `
                        <div class="registro-dado">
                            <span>
                                Consciência
                            </span>

                            <strong>
                                ${escaparHTML(
                                    registro.nivelConsciencia
                                )}
                            </strong>
                        </div>
                    `
                    : ""
            }

            ${
                registro.estadoGeral
                    ? `
                        <div class="registro-dado">
                            <span>
                                Estado geral
                            </span>

                            <strong>
                                ${escaparHTML(
                                    registro.estadoGeral
                                )}
                            </strong>
                        </div>
                    `
                    : ""
            }

        </div>

    `;

}


/* ============================================================
   SINAIS VITAIS
============================================================ */

function criarResumoSinaisVitais(
    sinais
) {

    if (!sinais) {

        return "";

    }


    const campos = [

        [
            "PA",
            sinais.pressaoArterial
        ],

        [
            "FC",
            sinais.frequenciaCardiaca
        ],

        [
            "FR",
            sinais.frequenciaRespiratoria
        ],

        [
            "Temperatura",
            sinais.temperatura
        ],

        [
            "SpO₂",
            sinais.saturacao
        ],

        [
            "Glicemia",
            sinais.glicemia
        ],

        [
            "Dor",
            sinais.dor
        ]

    ];


    const preenchidos =
        campos.filter(
            campo =>
                campo[1]
        );


    if (
        preenchidos.length === 0
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Sinais vitais
            </h4>

            <div class="dados-sinais">

                ${

                    preenchidos
                        .map(
                            campo => `

                                <div class="sinal-item">

                                    <span>
                                        ${escaparHTML(
                                            campo[0]
                                        )}
                                    </span>

                                    <strong>
                                        ${escaparHTML(
                                            campo[1]
                                        )}
                                    </strong>

                                </div>

                            `
                        )
                        .join("")

                }

            </div>

        </div>

    `;

}


/* ============================================================
   CUIDADOS
============================================================ */

function criarResumoCuidados(
    cuidados
) {

    if (
        !cuidados ||
        cuidados.length === 0
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Cuidados realizados
            </h4>

            <div class="tags-registro">

                ${

                    cuidados
                        .map(
                            cuidado => `

                                <span class="tag-registro">
                                    ${escaparHTML(
                                        cuidado
                                    )}
                                </span>

                            `
                        )
                        .join("")

                }

            </div>

        </div>

    `;

}


/* ============================================================
   MEDICAMENTOS
============================================================ */

function criarResumoMedicamentos(
    medicamentos
) {

    if (
        !medicamentos ||
        medicamentos.length === 0
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Medicamentos
            </h4>

            <div class="lista-resumo">

                ${

                    medicamentos
                        .map(
                            medicamento => `

                                <div class="item-resumo">

                                    <strong>
                                        ${escaparHTML(
                                            medicamento.nome ||
                                            "Medicamento não informado"
                                        )}
                                    </strong>

                                    <span>
                                        ${escaparHTML(
                                            medicamento.dose ||
                                            "Dose não informada"
                                        )}

                                        ${
                                            medicamento.via
                                                ? " · " +
                                                  escaparHTML(
                                                      medicamento.via
                                                  )
                                                : ""
                                        }

                                        ${
                                            medicamento.horario
                                                ? " · " +
                                                  escaparHTML(
                                                      medicamento.horario
                                                  )
                                                : ""
                                        }
                                    </span>

                                    ${
                                        medicamento.status
                                            ? `
                                                <small>
                                                    ${escaparHTML(
                                                        medicamento.status
                                                    )}
                                                </small>
                                            `
                                            : ""
                                    }

                                </div>

                            `
                        )
                        .join("")

                }

            </div>

        </div>

    `;

}


/* ============================================================
   PROCEDIMENTO
============================================================ */

function criarResumoProcedimento(
    procedimento
) {

    if (
        !procedimento
    ) {

        return "";

    }


    if (
        !procedimento.tipo &&
        !procedimento.local &&
        !procedimento.detalhes
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Procedimento
            </h4>

            ${
                procedimento.tipo
                    ? `
                        <p>
                            <strong>
                                Tipo:
                            </strong>

                            ${escaparHTML(
                                procedimento.tipo
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                procedimento.local
                    ? `
                        <p>
                            <strong>
                                Local:
                            </strong>

                            ${escaparHTML(
                                procedimento.local
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                procedimento.detalhes
                    ? `
                        <p>
                            ${escaparHTML(
                                procedimento.detalhes
                            )}
                        </p>
                    `
                    : ""
            }

        </div>

    `;

}


/* ============================================================
   FERIDA
============================================================ */

function criarResumoFerida(
    ferida
) {

    if (
        !ferida
    ) {

        return "";

    }


    if (
        !ferida.local &&
        !ferida.tipo &&
        !ferida.tamanho &&
        !ferida.aspecto &&
        !ferida.detalhes
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Curativo / ferida
            </h4>

            ${
                ferida.local
                    ? `
                        <p>
                            <strong>
                                Local:
                            </strong>

                            ${escaparHTML(
                                ferida.local
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                ferida.tipo
                    ? `
                        <p>
                            <strong>
                                Tipo:
                            </strong>

                            ${escaparHTML(
                                ferida.tipo
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                ferida.tamanho
                    ? `
                        <p>
                            <strong>
                                Dimensões:
                            </strong>

                            ${escaparHTML(
                                ferida.tamanho
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                ferida.aspecto
                    ? `
                        <p>
                            <strong>
                                Aspecto:
                            </strong>

                            ${escaparHTML(
                                ferida.aspecto
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                ferida.detalhes
                    ? `
                        <p>
                            ${escaparHTML(
                                ferida.detalhes
                            )}
                        </p>
                    `
                    : ""
            }

        </div>

    `;

}


/* ============================================================
   ALIMENTAÇÃO
============================================================ */

function criarResumoAlimentacao(
    alimentacao
) {

    if (
        !alimentacao
    ) {

        return "";

    }


    if (
        !alimentacao.tipo &&
        !alimentacao.aceitacao &&
        !alimentacao.detalhes
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Alimentação e hidratação
            </h4>

            ${
                alimentacao.tipo
                    ? `
                        <p>
                            <strong>
                                Tipo:
                            </strong>

                            ${escaparHTML(
                                alimentacao.tipo
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                alimentacao.aceitacao
                    ? `
                        <p>
                            <strong>
                                Aceitação:
                            </strong>

                            ${escaparHTML(
                                alimentacao.aceitacao
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                alimentacao.detalhes
                    ? `
                        <p>
                            ${escaparHTML(
                                alimentacao.detalhes
                            )}
                        </p>
                    `
                    : ""
            }

        </div>

    `;

}


/* ============================================================
   DISPOSITIVOS
============================================================ */

function criarResumoDispositivos(
    dispositivos,
    detalhes
) {

    if (
        (!dispositivos ||
        dispositivos.length === 0) &&
        !detalhes
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                Dispositivos
            </h4>

            ${
                dispositivos &&
                dispositivos.length
                    ? `
                        <div class="tags-registro">

                            ${

                                dispositivos
                                    .map(
                                        dispositivo => `

                                            <span class="tag-registro">
                                                ${escaparHTML(
                                                    dispositivo
                                                )}
                                            </span>

                                        `
                                    )
                                    .join("")

                            }

                        </div>
                    `
                    : ""
            }

            ${
                detalhes
                    ? `
                        <p>
                            ${escaparHTML(
                                detalhes
                            )}
                        </p>
                    `
                    : ""
            }

        </div>

    `;

}


/* ============================================================
   INTERCORRÊNCIA
============================================================ */

function criarResumoIntercorrencia(
    intercorrencia
) {

    if (
        !intercorrencia
    ) {

        return "";

    }


    if (
        !intercorrencia.tipo &&
        !intercorrencia.detalhes &&
        !intercorrencia.conduta
    ) {

        return "";

    }


    return `

        <div class="registro-bloco registro-intercorrencia">

            <h4>
                Intercorrência
            </h4>

            ${
                intercorrencia.tipo
                    ? `
                        <p>
                            <strong>
                                Tipo:
                            </strong>

                            ${escaparHTML(
                                intercorrencia.tipo
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                intercorrencia.detalhes
                    ? `
                        <p>
                            <strong>
                                Descrição:
                            </strong>

                            ${escaparHTML(
                                intercorrencia.detalhes
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                intercorrencia.conduta
                    ? `
                        <p>
                            <strong>
                                Conduta:
                            </strong>

                            ${escaparHTML(
                                intercorrencia.conduta
                            )}
                        </p>
                    `
                    : ""
            }

        </div>

    `;

}


/* ============================================================
   TEXTOS
============================================================ */

function criarResumoTexto(
    titulo,
    texto
) {

    if (
        !texto
    ) {

        return "";

    }


    return `

        <div class="registro-bloco">

            <h4>
                ${escaparHTML(
                    titulo
                )}
            </h4>

            <p>
                ${escaparHTML(
                    texto
                )}
            </p>

        </div>

    `;

}


/* ============================================================
   IDENTIFICAR TIPO DO REGISTRO
============================================================ */

function identificarTipoRegistro(
    registro
) {

    if (
        registro.intercorrencia &&
        (
            registro.intercorrencia.tipo ||
            registro.intercorrencia.detalhes
        )
    ) {

        return "Intercorrência";

    }


    if (
        registro.medicamentos &&
        registro.medicamentos.length > 0
    ) {

        return "Medicamento";

    }


    if (
        registro.procedimento &&
        (
            registro.procedimento.tipo ||
            registro.procedimento.detalhes
        )
    ) {

        return "Procedimento";

    }


    if (
        registro.ferida &&
        (
            registro.ferida.local ||
            registro.ferida.detalhes
        )
    ) {

        return "Curativo";

    }


    if (
        registro.cuidados &&
        registro.cuidados.length > 0
    ) {

        return "Cuidados";

    }


    if (
        registro.evolucao
    ) {

        return "Evolução";

    }


    return "Acompanhamento";

}


/* ============================================================
   ÍCONE DO TIPO
============================================================ */

function obterIconeTipo(
    tipo
) {

    switch (
        tipo
    ) {

        case "Medicamento":
            return "💊";

        case "Procedimento":
            return "🩺";

        case "Curativo":
            return "🩹";

        case "Cuidados":
            return "🫶";

        case "Intercorrência":
            return "⚠";

        case "Evolução":
            return "📋";

        default:
            return "✓";

    }

}


/* ============================================================
   TEXTO COMPLETO PARA PESQUISA
============================================================ */

function obterTextoRegistro(
    registro
) {

    try {

        return JSON.stringify(
            registro
        );

    } catch (
        erro
    ) {

        return "";

    }

}


/* ============================================================
   RESUMO / CONTADORES
============================================================ */

function atualizarResumo() {

    const pacientes =
        obterPacientes();


    const todos =
        obterTodosRegistros();


    const totalPacientes =
        pacientes.length;


    const totalRegistros =
        todos.length;


    const hoje =
        new Date();


    const registrosHoje =
        todos.filter(
            item => {

                if (
                    !item.registro.dataRegistro
                ) {

                    return false;

                }


                const data =
                    new Date(
                        item.registro.dataRegistro
                    );


                return (
                    data.toDateString() ===
                    hoje.toDateString()
                );

            }
        ).length;


    const elementoPacientes =
        elemento(
            "totalPacientes"
        );


    const elementoRegistros =
        elemento(
            "totalRegistros"
        );


    const elementoHoje =
        elemento(
            "registrosHoje"
        );


    if (
        elementoPacientes
    ) {

        elementoPacientes.textContent =
            totalPacientes;

    }


    if (
        elementoRegistros
    ) {

        elementoRegistros.textContent =
            totalRegistros;

    }


    if (
        elementoHoje
    ) {

        elementoHoje.textContent =
            registrosHoje;

    }

}


/* ============================================================
   PAGINAÇÃO
============================================================ */

function atualizarPaginacao(
    total
) {

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                total /
                REGISTROS_POR_PAGINA
            )
        );


    const paginaAtualElemento =
        elemento(
            "paginaAtual"
        );


    const totalPaginasElemento =
        elemento(
            "totalPaginas"
        );


    const btnAnterior =
        elemento(
            "btnPaginaAnterior"
        );


    const btnProxima =
        elemento(
            "btnPaginaProxima"
        );


    if (
        paginaAtualElemento
    ) {

        paginaAtualElemento.textContent =
            paginaAtual;

    }


    if (
        totalPaginasElemento
    ) {

        totalPaginasElemento.textContent =
            totalPaginas;

    }


    if (
        btnAnterior
    ) {

        btnAnterior.disabled =
            paginaAtual <= 1;

    }


    if (
        btnProxima
    ) {

        btnProxima.disabled =
            paginaAtual >= totalPaginas;

    }

}


/* ============================================================
   LIMPAR FILTROS
============================================================ */

function limparFiltros() {

    const campoPesquisa =
        elemento(
            "campoPesquisa"
        );


    const filtroTipo =
        elemento(
            "filtroTipo"
        );


    const filtroData =
        elemento(
            "filtroData"
        );


    if (
        campoPesquisa
    ) {

        campoPesquisa.value =
            "";

    }


    if (
        filtroTipo
    ) {

        filtroTipo.value =
            "";

    }


    if (
        filtroData
    ) {

        filtroData.value =
            "";

    }


    paginaAtual = 1;


    aplicarFiltros();

}


/* ============================================================
   ABRIR REGISTRO COMPLETO
============================================================ */

function abrirRegistroCompleto(
    paciente,
    registro
) {

    const modal =
        elemento(
            "modalRegistro"
        );


    if (!modal) {

        mostrarRegistroEmJanela(
            paciente,
            registro
        );

        return;

    }


    const conteudo =
        elemento(
            "conteudoModalRegistro"
        );


    if (!conteudo) {

        return;

    }


    conteudo.innerHTML =
        criarRegistroCompletoHTML(
            paciente,
            registro
        );


    modal.classList.add(
        "ativo"
    );


    const fechar =
        elemento(
            "fecharModalRegistro"
        );


    if (
        fechar
    ) {

        fechar.onclick =
            () => {

                modal.classList.remove(
                    "ativo"
                );

            };

    }


    modal.onclick =
        event => {

            if (
                event.target ===
                modal
            ) {

                modal.classList.remove(
                    "ativo"
                );

            }

        };

}


/* ============================================================
   REGISTRO COMPLETO
============================================================ */

function criarRegistroCompletoHTML(
    paciente,
    registro
) {

    const data =
        formatarDataHora(
            registro.dataRegistro
        );


    const dados =
        Object.entries(
            registro
        );


    return `

        <div class="modal-cabecalho">

            <div>

                <span>
                    Registro de acompanhamento
                </span>

                <h2>
                    ${escaparHTML(
                        paciente.nomeCompleto
                    )}
                </h2>

                <p>
                    Prontuário:
                    <strong>
                        ${escaparHTML(
                            paciente.prontuario
                        )}
                    </strong>
                </p>

            </div>

            <div class="modal-data">

                ${escaparHTML(
                    data
                )}

            </div>

        </div>


        <div class="modal-corpo">

            ${

                dados
                    .map(
                        ([chave, valor]) => {

                            if (
                                chave ===
                                "id" ||
                                chave ===
                                "dataRegistro"
                            ) {

                                return "";

                            }


                            return criarCampoCompleto(
                                chave,
                                valor
                            );

                        }
                    )
                    .join("")

            }

        </div>

    `;

}


/* ============================================================
   CAMPO COMPLETO
============================================================ */

function criarCampoCompleto(
    chave,
    valor
) {

    const titulo =
        formatarNomeCampo(
            chave
        );


    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "";

    }


    if (
        Array.isArray(
            valor
        )
    ) {

        if (
            valor.length === 0
        ) {

            return "";

        }


        return `

            <div class="modal-secao">

                <h3>
                    ${escaparHTML(
                        titulo
                    )}
                </h3>

                <div class="tags-registro">

                    ${

                        valor
                            .map(
                                item => {

                                    if (
                                        typeof item ===
                                        "object"
                                    ) {

                                        return `
                                            <span class="tag-registro">
                                                ${escaparHTML(
                                                    JSON.stringify(
                                                        item
                                                    )
                                                )}
                                            </span>
                                        `;

                                    }


                                    return `
                                        <span class="tag-registro">
                                            ${escaparHTML(
                                                item
                                            )}
                                        </span>
                                    `;

                                }
                            )
                            .join("")

                    }

                </div>

            </div>

        `;

    }


    if (
        typeof valor ===
        "object"
    ) {

        return `

            <div class="modal-secao">

                <h3>
                    ${escaparHTML(
                        titulo
                    )}
                </h3>

                <div class="modal-subdados">

                    ${

                        Object.entries(
                            valor
                        )
                        .map(
                            (
                                [
                                    subChave,
                                    subValor
                                ]
                            ) => {

                                if (
                                    subValor ===
                                    ""
                                    ||
                                    subValor ===
                                    null
                                    ||
                                    subValor ===
                                    undefined
                                ) {

                                    return "";

                                }


                                return `

                                    <div class="modal-dado">

                                        <span>
                                            ${escaparHTML(
                                                formatarNomeCampo(
                                                    subChave
                                                )
                                            )}
                                        </span>

                                        <strong>
                                            ${escaparHTML(
                                                typeof subValor ===
                                                "object"
                                                    ? JSON.stringify(
                                                        subValor
                                                    )
                                                    : subValor
                                            )}
                                        </strong>

                                    </div>

                                `;

                            }
                        )
                        .join("")

                    }

                </div>

            </div>

        `;

    }


    return `

        <div class="modal-secao">

            <h3>
                ${escaparHTML(
                    titulo
                )}
            </h3>

            <p>
                ${escaparHTML(
                    valor
                )}
            </p>

        </div>

    `;

}


/* ============================================================
   JANELA ALTERNATIVA
============================================================ */

function mostrarRegistroEmJanela(
    paciente,
    registro
) {

    const janela =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!janela) {

        alert(
            "Não foi possível abrir o registro."
        );

        return;

    }


    janela.document.write(`

        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>
                Registro - ${escaparHTML(
                    paciente.nomeCompleto
                )}
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    background:
                        #fffbea;

                    color:
                        #333;

                    padding:
                        30px;

                }

                h1,
                h2,
                h3 {

                    color:
                        #9a7200;

                }

                .cabecalho {

                    border-bottom:
                        3px solid #f2c94c;

                    padding-bottom:
                        20px;

                    margin-bottom:
                        25px;

                }

                .bloco {

                    background:
                        #ffffff;

                    border:
                        1px solid #eadca8;

                    border-radius:
                        10px;

                    padding:
                        18px;

                    margin-bottom:
                        15px;

                }

                strong {

                    color:
                        #7c6100;

                }

            </style>

        </head>

        <body>

            ${criarRegistroCompletoHTML(
                paciente,
                registro
            )}

        </body>

        </html>

    `);


    janela.document.close();

}


/* ============================================================
   FORMATAR NOME DOS CAMPOS
============================================================ */

function formatarNomeCampo(
    campo
) {

    const nomes = {

        condicaoAtual:
            "Condição atual",

        nivelConsciencia:
            "Nível de consciência",

        estadoGeral:
            "Estado geral",

        sinaisVitais:
            "Sinais vitais",

        cuidados:
            "Cuidados realizados",

        detalhesCuidados:
            "Detalhes dos cuidados",

        medicamentos:
            "Medicamentos",

        procedimento:
            "Procedimento",

        ferida:
            "Curativo / ferida",

        alimentacao:
            "Alimentação e hidratação",

        dispositivos:
            "Dispositivos",

        detalhesDispositivos:
            "Detalhes dos dispositivos",

        intercorrencia:
            "Intercorrência",

        evolucao:
            "Evolução",

        observacoes:
            "Observações"

    };


    if (
        nomes[campo]
    ) {

        return nomes[campo];

    }


    return String(campo)
        .replace(
            /([A-Z])/g,
            " $1"
        )
        .replace(
            /^./,
            letra =>
                letra.toUpperCase()
        );

}


/* ============================================================
   FORMATAR DATA E HORA
============================================================ */

function formatarDataHora(
    data
) {

    if (
        !data
    ) {

        return "Data não informada";

    }


    const objeto =
        new Date(
            data
        );


    if (
        Number.isNaN(
            objeto.getTime()
        )
    ) {

        return "Data inválida";

    }


    return objeto.toLocaleString(
        "pt-BR",
        {
            dateStyle:
                "short",

            timeStyle:
                "short"
        }
    );

}


/* ============================================================
   ESCAPAR HTML
============================================================ */

function escaparHTML(
    texto
) {

    return String(
        texto ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
