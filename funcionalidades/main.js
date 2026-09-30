// ==========================================================
// BANCO DE DADOS LOCAL - SISTEMA DE ENFERMAGEM
// ==========================================================

const CHAVE_PACIENTES = "enfermagem_pacientes";
const CHAVE_PROFISSIONAIS = "enfermagem_profissionais";


// ==========================================================
// BANCO LOCAL - PACIENTES
// ==========================================================

function obterPacientes() {

    const dados = localStorage.getItem(CHAVE_PACIENTES);

    if (!dados) {
        return [];
    }

    try {

        const pacientes = JSON.parse(dados);

        return Array.isArray(pacientes)
            ? pacientes
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar pacientes:",
            erro
        );

        return [];
    }
}


function salvarPacientes(pacientes) {

    localStorage.setItem(
        CHAVE_PACIENTES,
        JSON.stringify(pacientes)
    );
}


// ==========================================================
// BANCO LOCAL - PROFISSIONAIS
// ==========================================================

function obterProfissionais() {

    const dados = localStorage.getItem(
        CHAVE_PROFISSIONAIS
    );

    if (!dados) {
        return [];
    }

    try {

        const profissionais = JSON.parse(dados);

        return Array.isArray(profissionais)
            ? profissionais
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar profissionais:",
            erro
        );

        return [];
    }
}


function salvarProfissionais(profissionais) {

    localStorage.setItem(
        CHAVE_PROFISSIONAIS,
        JSON.stringify(profissionais)
    );
}


// ==========================================================
// FUNÇÕES AUXILIARES
// ==========================================================

function somenteNumeros(valor) {

    return String(valor)
        .replace(/\D/g, "");
}


function normalizarTexto(texto) {

    return String(texto)
        .trim()
        .replace(/\s+/g, " ");
}


function normalizarComparacao(texto) {

    return normalizarTexto(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}


// ==========================================================
// PROFISSIONAL JÁ CADASTRADA
// ==========================================================

function profissionalJaCadastrada(nome) {

    const nomeNormalizado =
        normalizarComparacao(nome);

    const profissionais =
        obterProfissionais();

    return profissionais.some(
        profissional =>
            normalizarComparacao(
                profissional.nome
            ) === nomeNormalizado
    );
}


// ==========================================================
// PRONTUÁRIO
// ==========================================================

function gerarProntuario() {

    const pacientes = obterPacientes();

    if (pacientes.length === 0) {
        return "000001";
    }

    let maiorNumero = 0;

    pacientes.forEach(paciente => {

        const numero = parseInt(
            paciente.prontuario,
            10
        );

        if (
            !isNaN(numero) &&
            numero > maiorNumero
        ) {

            maiorNumero = numero;
        }
    });

    return String(
        maiorNumero + 1
    ).padStart(6, "0");
}


// ==========================================================
// IDADE
// ==========================================================

function calcularIdade(dataNascimento) {

    const nascimento = new Date(
        dataNascimento + "T00:00:00"
    );

    const hoje = new Date();

    let idade =
        hoje.getFullYear() -
        nascimento.getFullYear();

    const diferencaMes =
        hoje.getMonth() -
        nascimento.getMonth();

    if (
        diferencaMes < 0 ||
        (
            diferencaMes === 0 &&
            hoje.getDate() < nascimento.getDate()
        )
    ) {

        idade--;
    }

    return idade;
}


// ==========================================================
// VALIDAÇÃO DE NOME
// ==========================================================

function validarNome(nome) {

    const valor = normalizarTexto(nome);

    if (!valor) {

        return {
            valido: false,
            mensagem: "Este campo é obrigatório."
        };
    }

    const partes = valor.split(" ");

    if (partes.length < 2) {

        return {
            valido: false,
            mensagem: "Digite o nome completo."
        };
    }

    if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(valor)) {

        return {
            valido: false,
            mensagem:
                "O nome deve conter apenas letras."
        };
    }

    return {
        valido: true,
        mensagem: "Nome válido."
    };
}


// ==========================================================
// DATA DE NASCIMENTO
// ==========================================================

function validarDataNascimento(data) {

    if (!data) {

        return {
            valido: false,
            mensagem:
                "Informe a data de nascimento."
        };
    }

    const nascimento = new Date(
        data + "T00:00:00"
    );

    const hoje = new Date();

    if (nascimento > hoje) {

        return {
            valido: false,
            mensagem:
                "A data não pode ser futura."
        };
    }

    const idade = calcularIdade(data);

    if (idade > 101) {

        return {
            valido: false,
            mensagem:
                "A idade não pode ultrapassar 101 anos."
        };
    }

    if (idade < 0) {

        return {
            valido: false,
            mensagem:
                "Data de nascimento inválida."
        };
    }

    return {
        valido: true,
        mensagem:
            `Data válida. Idade: ${idade} anos.`
    };
}


// ==========================================================
// CPF FICTÍCIO
// ==========================================================

function validarCPF(cpf) {

    const numeros = somenteNumeros(cpf);

    if (numeros.length !== 11) {

        return {
            valido: false,
            mensagem:
                "O CPF deve possuir 11 números."
        };
    }

    return {
        valido: true,
        mensagem:
            "CPF preenchido corretamente."
    };
}


function cpfJaCadastrado(cpf) {

    const cpfNumeros =
        somenteNumeros(cpf);

    const pacientes =
        obterPacientes();

    return pacientes.some(
        paciente =>
            paciente.cpf === cpfNumeros
    );
}


// ==========================================================
// POSSÍVEL PACIENTE DUPLICADO
// ==========================================================

function pacienteJaCadastrado(
    nome,
    dataNascimento,
    nomeMae
) {

    const pacientes =
        obterPacientes();

    const nomeNormalizado =
        normalizarComparacao(nome);

    const maeNormalizada =
        normalizarComparacao(nomeMae);

    return pacientes.some(paciente => {

        return (
            normalizarComparacao(
                paciente.nomeCompleto
            ) === nomeNormalizado

            &&

            paciente.dataNascimento ===
                dataNascimento

            &&

            normalizarComparacao(
                paciente.nomeMae
            ) === maeNormalizada
        );
    });
}


// ==========================================================
// MÁSCARA CPF
// ==========================================================

function configurarCPF() {

    const campo =
        document.getElementById("cpf");

    if (!campo) {
        return;
    }

    campo.addEventListener(
        "input",
        function () {

            let valor =
                somenteNumeros(
                    this.value
                ).substring(0, 11);

            if (valor.length > 9) {

                valor = valor.replace(
                    /^(\d{3})(\d{3})(\d{3})(\d{0,2})$/,
                    "$1.$2.$3-$4"
                );

            } else if (valor.length > 6) {

                valor = valor.replace(
                    /^(\d{3})(\d{3})(\d{0,3})$/,
                    "$1.$2.$3"
                );

            } else if (valor.length > 3) {

                valor = valor.replace(
                    /^(\d{3})(\d{0,3})$/,
                    "$1.$2"
                );
            }

            this.value = valor;

            if (
                somenteNumeros(this.value).length === 11
            ) {

                validarCampoCPF(this);
            }
        }
    );
}


// ==========================================================
// MÁSCARA TELEFONE
// ==========================================================

function configurarTelefone(id) {

    const campo =
        document.getElementById(id);

    if (!campo) {
        return;
    }

    campo.addEventListener(
        "input",
        function () {

            let valor =
                somenteNumeros(
                    this.value
                ).substring(0, 11);

            if (valor.length > 10) {

                valor = valor.replace(
                    /^(\d{2})(\d{5})(\d{0,4})$/,
                    "($1) $2-$3"
                );

            } else if (valor.length > 6) {

                valor = valor.replace(
                    /^(\d{2})(\d{4})(\d{0,4})$/,
                    "($1) $2-$3"
                );

            } else if (valor.length > 2) {

                valor = valor.replace(
                    /^(\d{2})(\d{0,5})$/,
                    "($1) $2"
                );
            }

            this.value = valor;
        }
    );
}


// ==========================================================
// MÁSCARA CEP
// ==========================================================

function configurarCEP() {

    const campo =
        document.getElementById("cep");

    if (!campo) {
        return;
    }

    campo.addEventListener(
        "input",
        function () {

            let valor =
                somenteNumeros(
                    this.value
                ).substring(0, 8);

            if (valor.length > 5) {

                valor = valor.replace(
                    /^(\d{5})(\d{0,3})$/,
                    "$1-$2"
                );
            }

            this.value = valor;
        }
    );
}


// ==========================================================
// FEEDBACK
// ==========================================================

function feedback(
    campo,
    valido,
    mensagem
) {

    if (!campo) {
        return;
    }

    const elemento =
        document.getElementById(
            campo.id + "-feedback"
        );

    if (!elemento) {
        return;
    }

    campo.classList.remove(
        "campo-valido",
        "campo-invalido"
    );

    elemento.classList.remove(
        "valido",
        "invalido"
    );

    if (valido) {

        campo.classList.add(
            "campo-valido"
        );

        elemento.classList.add(
            "valido"
        );

        elemento.textContent =
            "✓ " + mensagem;

    } else {

        campo.classList.add(
            "campo-invalido"
        );

        elemento.classList.add(
            "invalido"
        );

        elemento.textContent =
            "✕ " + mensagem;
    }
}


function limparFeedback(campo) {

    if (!campo) {
        return;
    }

    const elemento =
        document.getElementById(
            campo.id + "-feedback"
        );

    campo.classList.remove(
        "campo-valido",
        "campo-invalido"
    );

    if (elemento) {

        elemento.textContent = "";

        elemento.className =
            "feedback-campo";
    }
}


// ==========================================================
// VALIDAÇÃO CPF
// ==========================================================

function validarCampoCPF(campo) {

    const resultado =
        validarCPF(campo.value);

    if (!resultado.valido) {

        feedback(
            campo,
            false,
            resultado.mensagem
        );

        return false;
    }

    if (
        cpfJaCadastrado(
            campo.value
        )
    ) {

        feedback(
            campo,
            false,
            "Este CPF já está cadastrado."
        );

        return false;
    }

    feedback(
        campo,
        true,
        "CPF disponível."
    );

    return true;
}


// ==========================================================
// CADASTRO DE PACIENTE
// ==========================================================

const formulario =
    document.getElementById(
        "formCadastro"
    );

if (formulario) {

    configurarCPF();

    configurarTelefone("telefone");

    configurarTelefone(
        "telefoneEmergencia"
    );

    configurarCEP();


    // ======================================================
    // NOMES
    // ======================================================

    [
        "nomeCompleto",
        "nomeMae",
        "nomePai"
    ].forEach(id => {

        const campo =
            document.getElementById(id);

        if (!campo) {
            return;
        }

        campo.addEventListener(
            "blur",
            function () {

                if (!this.value.trim()) {

                    if (this.required) {

                        feedback(
                            this,
                            false,
                            "Este campo é obrigatório."
                        );

                    } else {

                        limparFeedback(this);
                    }

                    return;
                }

                const resultado =
                    validarNome(
                        this.value
                    );

                feedback(
                    this,
                    resultado.valido,
                    resultado.mensagem
                );
            }
        );
    });


    // ======================================================
    // DATA
    // ======================================================

    const dataNascimento =
        document.getElementById(
            "dataNascimento"
        );

    if (dataNascimento) {

        dataNascimento.addEventListener(
            "change",
            function () {

                const resultado =
                    validarDataNascimento(
                        this.value
                    );

                feedback(
                    this,
                    resultado.valido,
                    resultado.mensagem
                );
            }
        );
    }


    // ======================================================
    // CPF
    // ======================================================

    const cpf =
        document.getElementById("cpf");

    if (cpf) {

        cpf.addEventListener(
            "blur",
            function () {

                if (!this.value.trim()) {

                    feedback(
                        this,
                        false,
                        "Informe o CPF."
                    );

                    return;
                }

                validarCampoCPF(this);
            }
        );
    }


    // ======================================================
    // E-MAIL
    // ======================================================

    const email =
        document.getElementById("email");

    if (email) {

        email.addEventListener(
            "blur",
            function () {

                if (!this.value.trim()) {

                    limparFeedback(this);

                    return;
                }

                const valido =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(this.value);

                feedback(
                    this,
                    valido,
                    valido
                        ? "E-mail válido."
                        : "Digite um e-mail válido."
                );
            }
        );
    }


    // ======================================================
    // ENVIO DO FORMULÁRIO DO PACIENTE
    // ======================================================

    formulario.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const mensagem =
                document.getElementById(
                    "mensagemCadastro"
                );


            // ==================================================
            // CAMPOS
            // ==================================================

            const nomeCompleto =
                document.getElementById(
                    "nomeCompleto"
                );

            const nomeMae =
                document.getElementById(
                    "nomeMae"
                );

            const nomePai =
                document.getElementById(
                    "nomePai"
                );

            const data =
                document.getElementById(
                    "dataNascimento"
                );

            const cpf =
                document.getElementById(
                    "cpf"
                );

            const telefone =
                document.getElementById(
                    "telefone"
                );

            const cep =
                document.getElementById(
                    "cep"
                );


            // ==================================================
            // VALIDAÇÕES
            // ==================================================

            const resultadoNome =
                validarNome(
                    nomeCompleto.value
                );

            const resultadoMae =
                validarNome(
                    nomeMae.value
                );

            const resultadoData =
                validarDataNascimento(
                    data.value
                );

            const resultadoCPF =
                validarCPF(
                    cpf.value
                );


            feedback(
                nomeCompleto,
                resultadoNome.valido,
                resultadoNome.mensagem
            );

            feedback(
                nomeMae,
                resultadoMae.valido,
                resultadoMae.mensagem
            );

            feedback(
                data,
                resultadoData.valido,
                resultadoData.mensagem
            );


            if (!resultadoCPF.valido) {

                feedback(
                    cpf,
                    false,
                    resultadoCPF.mensagem
                );
            }


            // ==================================================
            // CAMPOS OBRIGATÓRIOS
            // ==================================================

            let camposValidos = true;

            const obrigatorios =
                formulario.querySelectorAll(
                    "[required]"
                );

            obrigatorios.forEach(
                campo => {

                    if (
                        !campo.value.trim()
                    ) {

                        camposValidos = false;

                        feedback(
                            campo,
                            false,
                            "Este campo é obrigatório."
                        );
                    }
                }
            );


            if (
                !resultadoNome.valido ||
                !resultadoMae.valido ||
                !resultadoData.valido ||
                !resultadoCPF.valido ||
                !camposValidos
            ) {

                mensagem.textContent =
                    "Corrija os campos destacados antes de cadastrar.";

                mensagem.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // CPF DUPLICADO
            // ==================================================

            if (
                cpfJaCadastrado(
                    cpf.value
                )
            ) {

                feedback(
                    cpf,
                    false,
                    "Este CPF já está cadastrado."
                );

                mensagem.textContent =
                    "Já existe um paciente com esse CPF.";

                mensagem.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // POSSÍVEL DUPLICIDADE
            // ==================================================

            if (
                pacienteJaCadastrado(
                    nomeCompleto.value,
                    data.value,
                    nomeMae.value
                )
            ) {

                mensagem.textContent =
                    "Já existe um paciente com o mesmo nome, data de nascimento e nome da mãe.";

                mensagem.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // GERAR PRONTUÁRIO
            // ==================================================

            const prontuario =
                gerarProntuario();


            const numeroProntuario =
                document.getElementById(
                    "numeroProntuario"
                );

            if (numeroProntuario) {

                numeroProntuario.value =
                    prontuario;
            }


            // ==================================================
            // CRIAR PACIENTE
            // ==================================================

            const paciente = {

                prontuario: prontuario,

                nomeCompleto:
                    normalizarTexto(
                        nomeCompleto.value
                    ),

                nomeMae:
                    normalizarTexto(
                        nomeMae.value
                    ),

                nomePai:
                    normalizarTexto(
                        nomePai.value
                    ),

                dataNascimento:
                    data.value,

                idade:
                    calcularIdade(
                        data.value
                    ),

                cpf:
                    somenteNumeros(
                        cpf.value
                    ),

                rg:
                    normalizarTexto(
                        document.getElementById(
                            "rg"
                        ).value
                    ),

                telefone:
                    somenteNumeros(
                        telefone.value
                    ),

                email:
                    document.getElementById(
                        "email"
                    ).value
                        .trim()
                        .toLowerCase(),

                endereco: {

                    cep:
                        somenteNumeros(
                            cep.value
                        ),

                    logradouro:
                        normalizarTexto(
                            document.getElementById(
                                "logradouro"
                            ).value
                        ),

                    numero:
                        normalizarTexto(
                            document.getElementById(
                                "numero"
                            ).value
                        ),

                    complemento:
                        normalizarTexto(
                            document.getElementById(
                                "complemento"
                            ).value
                        ),

                    bairro:
                        normalizarTexto(
                            document.getElementById(
                                "bairro"
                            ).value
                        ),

                    cidade:
                        normalizarTexto(
                            document.getElementById(
                                "cidade"
                            ).value
                        ),

                    estado:
                        document.getElementById(
                            "estado"
                        ).value
                },


                contatoEmergencia: {

                    nome:
                        normalizarTexto(
                            document.getElementById(
                                "nomeEmergencia"
                            ).value
                        ),

                    parentesco:
                        normalizarTexto(
                            document.getElementById(
                                "parentescoEmergencia"
                            ).value
                        ),

                    telefone:
                        somenteNumeros(
                            document.getElementById(
                                "telefoneEmergencia"
                            ).value
                        )
                },


                familiar: {

                    nome:
                        normalizarTexto(
                            document.getElementById(
                                "responsavelFamiliar"
                            ).value
                        ),

                    parentesco:
                        normalizarTexto(
                            document.getElementById(
                                "parentescoFamiliar"
                            ).value
                        )
                },


                convenio:
                    normalizarTexto(
                        document.getElementById(
                            "convenio"
                        ).value
                    ),


                numeroCarteirinha:
                    normalizarTexto(
                        document.getElementById(
                            "numeroCarteirinha"
                        ).value
                    ),


                registros: [],


                dataCadastro:
                    new Date().toISOString()
            };


            // ==================================================
            // SALVAR NO BANCO LOCAL
            // ==================================================

            const pacientes =
                obterPacientes();

            pacientes.push(paciente);

            salvarPacientes(
                pacientes
            );


            // ==================================================
            // CONFIRMAÇÃO
            // ==================================================

            mensagem.textContent =
                `Paciente cadastrado com sucesso! Prontuário: ${prontuario}`;

            mensagem.className =
                "mensagem sucesso";


            console.log(
                "PACIENTE SALVO:",
                paciente
            );

            console.log(
                "BANCO LOCAL:",
                obterPacientes()
            );


            // ==================================================
            // REDIRECIONAR PARA LOGIN
            // ==================================================

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1500
            );

        }
    );
}


// ==========================================================
// CADASTRO DA PROFISSIONAL
// ==========================================================

const formularioProfissional =
    document.getElementById(
        "formCadastroProfissional"
    );

if (formularioProfissional) {

    const nomeProfissional =
        document.getElementById(
            "nomeProfissional"
        );

    const senhaProfissional =
        document.getElementById(
            "senhaProfissional"
        );

    const confirmarSenha =
        document.getElementById(
            "confirmarSenha"
        );

    const mensagemProfissional =
        document.getElementById(
            "mensagemProfissional"
        );


    // ======================================================
    // NOME
    // ======================================================

    nomeProfissional.addEventListener(
        "blur",
        function () {

            if (!this.value.trim()) {

                feedback(
                    this,
                    false,
                    "Informe o nome da profissional."
                );

                return;
            }

            const resultado =
                validarNome(
                    this.value
                );

            feedback(
                this,
                resultado.valido,
                resultado.mensagem
            );
        }
    );


    // ======================================================
    // SENHA
    // ======================================================

    senhaProfissional.addEventListener(
        "blur",
        function () {

            if (!this.value.trim()) {

                feedback(
                    this,
                    false,
                    "Informe uma senha."
                );

                return;
            }

            if (this.value.length < 6) {

                feedback(
                    this,
                    false,
                    "A senha deve possuir pelo menos 6 caracteres."
                );

                return;
            }

            feedback(
                this,
                true,
                "Senha válida."
            );
        }
    );


    // ======================================================
    // CONFIRMAÇÃO DA SENHA
    // ======================================================

    confirmarSenha.addEventListener(
        "blur",
        function () {

            if (!this.value.trim()) {

                feedback(
                    this,
                    false,
                    "Confirme sua senha."
                );

                return;
            }

            if (
                this.value !==
                senhaProfissional.value
            ) {

                feedback(
                    this,
                    false,
                    "As senhas não coincidem."
                );

                return;
            }

            feedback(
                this,
                true,
                "As senhas coincidem."
            );
        }
    );


    // ======================================================
    // ENVIO DO CADASTRO DA PROFISSIONAL
    // ======================================================

    formularioProfissional.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const nome =
                normalizarTexto(
                    nomeProfissional.value
                );

            const senha =
                senhaProfissional.value;

            const senhaConfirmacao =
                confirmarSenha.value;


            // ==================================================
            // VALIDAÇÃO DO NOME
            // ==================================================

            const resultadoNome =
                validarNome(nome);

            feedback(
                nomeProfissional,
                resultadoNome.valido,
                resultadoNome.mensagem
            );


            // ==================================================
            // VALIDAÇÃO DA SENHA
            // ==================================================

            let senhaValida = true;

            if (!senha) {

                senhaValida = false;

                feedback(
                    senhaProfissional,
                    false,
                    "Informe uma senha."
                );

            } else if (senha.length < 6) {

                senhaValida = false;

                feedback(
                    senhaProfissional,
                    false,
                    "A senha deve possuir pelo menos 6 caracteres."
                );

            } else {

                feedback(
                    senhaProfissional,
                    true,
                    "Senha válida."
                );
            }


            // ==================================================
            // CONFIRMAÇÃO
            // ==================================================

            let confirmacaoValida = true;

            if (!senhaConfirmacao) {

                confirmacaoValida = false;

                feedback(
                    confirmarSenha,
                    false,
                    "Confirme sua senha."
                );

            } else if (
                senha !== senhaConfirmacao
            ) {

                confirmacaoValida = false;

                feedback(
                    confirmarSenha,
                    false,
                    "As senhas não coincidem."
                );

            } else {

                feedback(
                    confirmarSenha,
                    true,
                    "As senhas coincidem."
                );
            }


            // ==================================================
            // CAMPOS OBRIGATÓRIOS
            // ==================================================

            let camposValidos = true;

            const obrigatorios =
                formularioProfissional.querySelectorAll(
                    "[required]"
                );

            obrigatorios.forEach(
                campo => {

                    if (
                        !campo.value.trim()
                    ) {

                        camposValidos = false;

                        feedback(
                            campo,
                            false,
                            "Este campo é obrigatório."
                        );
                    }
                }
            );


            // ==================================================
            // VERIFICAÇÃO GERAL
            // ==================================================

            if (
                !resultadoNome.valido ||
                !senhaValida ||
                !confirmacaoValida ||
                !camposValidos
            ) {

                mensagemProfissional.textContent =
                    "Corrija os campos destacados antes de cadastrar.";

                mensagemProfissional.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // PROFISSIONAL DUPLICADA
            // ==================================================

            if (
                profissionalJaCadastrada(nome)
            ) {

                feedback(
                    nomeProfissional,
                    false,
                    "Esta profissional já está cadastrada."
                );

                mensagemProfissional.textContent =
                    "Já existe uma profissional cadastrada com esse nome.";

                mensagemProfissional.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // CRIAR PROFISSIONAL
            // ==================================================

            const profissional = {

                nome: nome,

                senha: senha,

                dataCadastro:
                    new Date().toISOString()
            };


            // ==================================================
            // SALVAR
            // ==================================================

            const profissionais =
                obterProfissionais();

            profissionais.push(
                profissional
            );

            salvarProfissionais(
                profissionais
            );


            // ==================================================
            // CONFIRMAÇÃO
            // ==================================================

            mensagemProfissional.textContent =
                "Profissional cadastrada com sucesso!";

            mensagemProfissional.className =
                "mensagem sucesso";


            console.log(
                "PROFISSIONAL SALVA:",
                profissional
            );

            console.log(
                "PROFISSIONAIS:",
                obterProfissionais()
            );


            // ==================================================
            // REDIRECIONAR PARA LOGIN
            // ==================================================

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1500
            );

        }
    );
}


// ==========================================================
// LOGIN DA PROFISSIONAL
// ==========================================================

const formularioLogin =
    document.getElementById(
        "formLogin"
    );

if (formularioLogin) {

    const loginNome =
        document.getElementById(
            "loginNome"
        );

    const loginSenha =
        document.getElementById(
            "loginSenha"
        );

    const mensagemLogin =
        document.getElementById(
            "mensagemLogin"
        );


    // ======================================================
    // NOME
    // ======================================================

    loginNome.addEventListener(
        "blur",
        function () {

            if (!this.value.trim()) {

                feedback(
                    this,
                    false,
                    "Informe seu nome."
                );

                return;
            }

            const resultado =
                validarNome(
                    this.value
                );

            feedback(
                this,
                resultado.valido,
                resultado.mensagem
            );
        }
    );


    // ======================================================
    // SENHA
    // ======================================================

    loginSenha.addEventListener(
        "blur",
        function () {

            if (!this.value.trim()) {

                feedback(
                    this,
                    false,
                    "Informe sua senha."
                );

                return;
            }

            feedback(
                this,
                true,
                "Senha preenchida."
            );
        }
    );


    // ======================================================
    // LOGIN
    // ======================================================

    formularioLogin.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const nome =
                normalizarTexto(
                    loginNome.value
                );

            const senha =
                loginSenha.value;


            // ==================================================
            // CAMPOS OBRIGATÓRIOS
            // ==================================================

            let camposValidos = true;


            if (!nome) {

                camposValidos = false;

                feedback(
                    loginNome,
                    false,
                    "Informe seu nome."
                );
            }


            if (!senha) {

                camposValidos = false;

                feedback(
                    loginSenha,
                    false,
                    "Informe sua senha."
                );
            }


            if (!camposValidos) {

                mensagemLogin.textContent =
                    "Preencha todos os campos.";

                mensagemLogin.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // PROCURAR PROFISSIONAL
            // ==================================================

            const profissionais =
                obterProfissionais();

            const nomeNormalizado =
                normalizarComparacao(nome);


            const profissional =
                profissionais.find(
                    profissional =>
                        normalizarComparacao(
                            profissional.nome
                        ) ===
                        nomeNormalizado
                );


            // ==================================================
            // PROFISSIONAL NÃO ENCONTRADA
            // ==================================================

            if (!profissional) {

                feedback(
                    loginNome,
                    false,
                    "Profissional não encontrada."
                );

                mensagemLogin.textContent =
                    "Nome ou senha incorretos.";

                mensagemLogin.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // SENHA INCORRETA
            // ==================================================

            if (
                profissional.senha !== senha
            ) {

                feedback(
                    loginSenha,
                    false,
                    "Senha incorreta."
                );

                mensagemLogin.textContent =
                    "Nome ou senha incorretos.";

                mensagemLogin.className =
                    "mensagem erro";

                return;
            }


            // ==================================================
            // LOGIN CORRETO
            // ==================================================

            feedback(
                loginNome,
                true,
                "Profissional encontrada."
            );

            feedback(
                loginSenha,
                true,
                "Senha correta."
            );


            mensagemLogin.textContent =
                "Login realizado com sucesso!";

            mensagemLogin.className =
                "mensagem sucesso";


            // ==================================================
            // SESSÃO
            // ==================================================

            sessionStorage.setItem(
                "enfermagem_profissional_logada",
                JSON.stringify({
                    nome: profissional.nome
                })
            );


            // ==================================================
            // REDIRECIONAR
            // ==================================================

            setTimeout(
                function () {

                    window.location.href =
                        "index.html";

                },
                1000
            );

        }
    );
}