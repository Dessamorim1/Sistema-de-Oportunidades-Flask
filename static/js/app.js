let concorrentesAtuais = [];
let concorrentesCadastrados = [];

// Listeners

window.addEventListener('load', () => {
    carregar_concorrentes();
    carregarTiposItens('ItemsSafe');
    gerarLinhasItens(20);
    gerarLinhasConcorrentes(100);

    const itemSelect = document.getElementById("ItemSafeModal");
    if (itemSelect) {
        itemSelect.addEventListener("change", function () {
            if (inputAtivo && this.value) {
                inputAtivo.value = this.value;
                fecharModalItemSafe();
            }
        });
    }
});

carregarTiposItens("ItemsSafe", (code) => {
    carregarItensFiltradosGenerico("ItemSafe", code);
});

// Alerta

function alerta(tipo, titulo, mensagem) {
    return Swal.fire({
        icon: tipo,
        title: titulo,
        text: mensagem,
        confirmButtonText: "Fechar",
        customClass: {
            popup: "meu-alerta-popup",
            title: "meu-alerta-titulo",
            confirmButton: "meu-alerta-botao",
        },
    });
}

// Mensagens erro de rede 

function mensagem_erro(err, tituloPadrao = "Erro") {
    const msg = (err && err.message) ? err.message : String(err);

    const isNetwork =
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("Load failed");

    if (isNetwork) {
        alerta('error', 'Servidor indisponível',
            'Não consegui conectar ao servidor. Verifique se o Flask está ligado, a URL/porta está correta, ou se há bloqueio (CORS/rede).');
        return;
    }

    alerta('error', tituloPadrao, msg);
}

// Selects

async function carregar_concorrentes() {
    fetch('/api/buscar_concorrentes')
        .then(res => res.json())
        .then(lista => {
            concorrentesCadastrados = lista;
            nomes = lista.map(c => c.Name);

            const concorrente = document.getElementById("concorrente");
            if (!concorrente) return;

            concorrente.innerHTML = '<option value="">Selecione</option>';
            lista.forEach(c => {
                const option = document.createElement("option");
                option.value = c.SequenceNo;
                option.text = c.Name;
                concorrente.appendChild(option);
            });
            const optionNew = document.createElement("option");
            optionNew.value = "novo";
            optionNew.text = "Definir Novo";
            concorrente.appendChild(optionNew);

            concorrente.addEventListener("change", function () {
                if (this.value === "novo") {
                    this.value = "";
                    abrirModal();
                }
            })
        })
        .catch(() => {
            alerta('error', 'Erro ao carregar competidores', 'Não foi possível carregar a lista de competidores. Por favor, tente novamente mais tarde.');
        });
}

// ===== Carrega tipos de itens =====

function carregarTiposItens(selectId, onChangeCallback) {
    fetch('/api/buscar_tipo_itens')
        .then(res => res.json())
        .then(lista => {
            console.log(lista)
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = '<option value="">Selecione</option>';
            lista.forEach(c => {
                const option = document.createElement("option");
                option.value = c.Code;
                option.text = c.Name;
                select.appendChild(option);
                console.log("to entrnado no foreach");
            });
            if (onChangeCallback) {
                select.addEventListener("change", () => {
                    onChangeCallback(select.value);
                });
            }
        })
        .catch(() => {
            alerta('error', 'Erro ao carregar tipos de itens', 'Tente novamente mais tarde.');
        });
}

// Buscar Oportunidade

async function buscarOportunidade() {
    const seq_no = document.getElementById('op').value.trim();

    if (!seq_no) {
        return alerta('warning', 'Atenção', 'Informe o número da oportunidade.');
    }

    try {
        const data_list = await apiFetchJson(`/api/buscar_oportunidade?seq_no=${encodeURIComponent(seq_no)}`);

        if (!data_list) return;

        const data = Array.isArray(data_list) ? data_list[0] : data_list;

        if (!data) {
            throw new Error("Oportunidade não encontrada.");
        }

        const campos = {
            cod: data.CardCode,
            cliente: data.CustomerName,
            nomeopor: data.OpportunityName,
            dataaber: data.StartDate,
            fechamento: data.PredictedClosingDate,
            valor: data.MaxLocalTotal,
            vendedor: data.SalesPerson,
            status: data.Status,
            U_Modalidade: data.U_Modalidade,
            U_Esfera: data.U_Esfera,
            U_NumLicitacao: data.U_NumLicitacao,
            U_NumOpor: seq_no
        };

        Object.entries(campos).forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el) el.value = valor ?? "";
        });

        concorrentesAtuais = data.SalesOpportunitiesCompetition || [];
        preencherConcorrentes(concorrentesAtuais);
        buscarItens(seq_no);

    } catch (err) {
        mensagem_erro(err, "Erro ao buscar oportunidade");
        document.querySelectorAll("input[disabled]").forEach(el => el.value = "");
    }
}

// Preencher Os comptidores da oportunidade

function preencherConcorrentes(lista) {
    const linhas = document.querySelectorAll(".concorrentes-grid div input, .concorrentes-grid div select");

    for (let i = 0; i < linhas.length; i += 12) {
        const camposLinha = Array.from(linhas).slice(i, i + 12);

        camposLinha[0].value = "";
        camposLinha[1].innerHTML = '<option value=""></option>';
        camposLinha[2].innerHTML = '<option value=""></option><option value="Baixo">Baixo</option><option value="Médio">Médio</option><option value="Alto">Alto</option>';
        for (let j = 3; j <= 11; j++) {
            if (camposLinha[j]) camposLinha[j].value = "";
        }
    }

    for (let i = 0; i < lista.length; i++) {
        const c = lista[i] || {};
        const campos = Array.from(linhas).slice(i * 12, (i + 1) * 12);
        if (campos.length < 12) break;

        campos[0].value = c.RowNo || '';

        const select = campos[1];
        select.innerHTML = '';
        concorrentesCadastrados.forEach(cOpt => {
            const opt = document.createElement("option");
            opt.value = cOpt.SequenceNo;
            opt.text = cOpt.Name;
            select.appendChild(opt);
        });

        const optionSelecionada = Array.from(select.options).find(opt => Number(opt.value) === Number(c.Competition));
        select.value = optionSelecionada ? optionSelecionada.value : "";

        const grauSelect = campos[2];
        switch (c.ThreatLevel) {
            case 'tlLow': grauSelect.value = "Baixo"; break;
            case 'tlMedium': grauSelect.value = "Médio"; break;
            case 'tlHigh': grauSelect.value = "Alto"; break;
            default: grauSelect.value = "";
        }

        campos[3].value = c.U_Marca || '';
        campos[4].value = c.U_Modelo || '';
        campos[5].value = c.U_Observacao || '';
        campos[6].value = c.U_Quantidade || '';
        campos[7].value = formatarMoedaParaExibicao(c.U_ValorUnit);
        campos[8].value = formatarMoedaParaExibicao(c.U_ValorTot);
        campos[9].value = c.U_Item || '';
        campos[10].value = c.U_Posicao || '';
        campos[11].value = c.U_ItemCode || '';
    }
}

function preencherItens(listaItens) {
    const campos = document.querySelectorAll(".itens-grid input");

    for (let i = 0; i < listaItens.length && i * 3 + 2 < campos.length; i++) {
        const item = listaItens[i];
        const base = i * 3;
        campos[base].value = item.U_Item || '';
        campos[base + 1].value = item.U_Descricao || '';
        campos[base + 2].value = item.U_Qtde || '';
    }

    for (let i = listaItens.length; i * 3 + 2 < campos.length; i++) {
        const base = i * 3;
        campos[base].value = '';
        campos[base + 1].value = '';
        campos[base + 2].value = '';
    }
}

async function buscarItens(seq_no) {
    if (!seq_no) {
        preencherItens([]);
        return;
    }

    try {
        const dados = await apiFetchJson(
            `/api/buscar_itens?seq_no=${encodeURIComponent(seq_no)}`
        );

        if (!dados) {
            preencherItens([]);
            return;
        }

        const listaItens = dados.value || dados || [];
        preencherItens(listaItens);

    } catch (err) {
        console.error(err);
        preencherItens([]);
        alerta('error', 'Erro ao buscar itens', 'Não foi possível carregar os itens. Tente novamente mais tarde.');
    }
}

// Funções pra controle de expiração no fetch

async function apiFetchJson(url, options = {}) {
    const res = await fetch(url, { credentials: "same-origin", ...options });

    if (res.status === 401) {
        await alerta('error', "Sessão expirada", "Faça login novamente.");
        window.location.href = "/";
        return null;
    }

    let data = null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) {
        data = await res.json();
    } else {
        const txt = await res.text();
        data = txt ? { message: txt } : null;
    }

    if (!res.ok) {
        throw new Error(data?.erro || data?.message || `Erro HTTP ${res.status}`);
    }

    return data;
}

async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, {
            credentials: "same-origin",
            ...options
        });

        if (response.status === 401) {
            await alerta('error', "Sessão expirada", "Faça login novamente.");
            window.location.href = "/";
            return null;
        }

        return response;

    } catch (err) {
        console.error("Erro de rede:", err);
        throw err;
    }
}

// Gerar Linhas da grid

function gerarLinhasConcorrentes(qtd = 50) {
    const grid = document.getElementById("grid-concorrentes");
    if (!grid) return;

    grid.innerHTML = `
        <div>#</div>
        <div>Concorrente</div>
        <div>Grau de Ameaça</div>
        <div>Marca/Fabricante</div>
        <div>Modelo</div>
        <div>Observação</div>
        <div>Qtde</div>
        <div>V. Unitário</div>
        <div>V. Total</div>
        <div>Item Cliente</div>
        <div>Posição</div>
        <div>Item Safe</div>
    `;

    for (let i = 0; i < qtd; i++) {
        grid.insertAdjacentHTML("beforeend", `
            <div><input type="number" class="rowno" readonly value="${i + 1}" /></div>
            <div>
                <select class="grid-select concorrente-select">
                    <option value=""></option>
                </select>
            </div>
            <div>
                <select class="grid-select">
                    <option value=""></option>
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                </select>
            </div>
            <div><input type="text" class="marca" /></div>
            <div><input type="text" class="modelo" /></div>
            <div><input type="text" class="observacao" /></div>
            <div><input type="number" class="quantidade" /></div>
            <div><input type="text" class="valor-unitario" /></div>
            <div><input type="text" class="valor-total" /></div>
            <div><input class="campo-u_item" type="number" /></div>
            <div><input type="number" class="posicao" /></div>
            <div class="item-field" style="display:flex; align-items:center; gap:4px;">
              <button type="button" onclick="abrirModalItemSafe(this)" style="padding:2px 6px;"><i
                                    class="ph-fill ph-arrow-fat-right" style="color:rgba(249, 190, 54)"></i></button>
                <input type="text" class="nome-item" readonly style="flex:1;" />
            </div>
        `);
    }
}

function gerarLinhasItens(qtd = 30) {
    const grid = document.getElementById("grid-itens");
    if (!grid) {
        console.error("Grid de itens não encontrada!");
        return;
    }

    grid.innerHTML = `
        <div class="grid-header">Número Item</div>
        <div class="grid-header">Descrição</div>
        <div class="grid-header">Quantidade</div>
    `;

    for (let i = 0; i < qtd; i++) {
        grid.insertAdjacentHTML("beforeend", `
            <div><input type="number" class="numero-item" readonly value="${i + 1}" /></div>
            <div><input type="text" readonly class="descricao-item" /></div>
            <div><input type="number" readonly class="quantidade-item" /></div>
        `);
    }

    console.log(`${qtd} linhas de itens geradas!`);
}

// Toglled night and day

function toggled() {
    document.body.classList.toggle("dark");
}

// Botão Logout

async function chamar_logout() {

    const confirmacao = await Swal.fire({
        icon: "question",
        title: "Deseja sair?",
        text: "Sua sessão será encerrada.",
        showCancelButton: true,
        confirmButtonText: "Sair",
        cancelButtonText: "Cancelar",

        customClass: {
            popup: "logout-popup"
        }
    });

    if (!confirmacao.isConfirmed) return;

    const response = await fetch("/logout", {
        method: "POST"
    });

    let data = {};
    try {
        data = await response.json();
    } catch { }

    if (response.ok && data.ok) {
        window.location.href = "/";
    } else {
        Swal.fire("Erro", "Não foi possível encerrar a sessão.", "error");
    }
}

// Aba itens

function abrirTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(icon => {
        icon.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');

    el.classList.add('active');
}

// Formatar Moedas

function formatarMoedaParaExibicao(valor) {
    if (valor == null) return '';
    let v = Number(valor).toFixed(2).replace('.', ',');
    v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return v;
}

// ===== Carrega itens filtrados =====

async function carregarItensFiltradosGenerico(selectId, code, inputAtivo = null) {
    const $select = $('#' + selectId);
    $select.empty().append('<option>Carregando...</option>');

    if (!code) {
        $select.empty().append('<option value="">Selecione</option>');
        if ($select.hasClass("select2-hidden-accessible")) $select.val('').trigger('change');
        return;
    }

    try {
        const lista = await apiFetchJson(
            `/api/buscar_itens_filtrados?U_FOC=${encodeURIComponent(code)}`
        );
        if (!lista) return;

        todos_itens_safe = lista;

        $select.empty().append('<option value="">Selecione</option>');

        if (!Array.isArray(lista) || lista.length === 0) {
            $select.append('<option value="">Nenhum item</option>');
            if ($select.hasClass("select2-hidden-accessible")) $select.val('').trigger('change');
            alerta('error', 'Nenhum item encontrado', 'Não existe nenhum item com esse tipo.');
            return;
        }

        lista.forEach(item => {
            $select.append(new Option(item.ItemName, item.ItemCode));
        });

        if ($select.hasClass("select2-hidden-accessible")) {
            $select.trigger('change');
        } else {
            $select.select2({
                placeholder: 'Digite para filtrar...',
                allowClear: true,
                width: 'resolve'
            });
        }

        if (inputAtivo) {
            $select.off('select2:select').on('select2:select', function (e) {
                const selecionado = e.params.data; 
                inputAtivo.value = selecionado.id || '';
                fecharModalItemSafe();
            });

            $select.off('select2:clear').on('select2:clear', function () {
                inputAtivo.value = '';
            });
        }

        if (lista.length === 1) {
            $select.val(lista[0].ItemCode).trigger('change');
        }

    } catch (err) {
        console.error(err);
        mensagem_erro(err, 'Erro ao carregar itens');
    }
}

// ===== Modal Itens =====

function abrirModalItemSafe(botao) {
    inputAtivo = botao.parentElement.querySelector(".nome-item");
    document.getElementById("modalItemSafe").style.display = "flex";

    document.getElementById("ItemsSafeModal").innerHTML = '<option value="">Carregando...</option>';
    document.getElementById("ItemSafeModal").innerHTML = '<option value="">Selecione</option>';

    carregarTiposItens("ItemsSafeModal", (code) => {
        carregarItensFiltradosGenerico("ItemSafeModal", code, inputAtivo);
    });
}

function fecharModalItemSafe() {
    document.getElementById("modalItemSafe").style.display = "none";
    inputAtivo = null;
}

// ===== Modal Concorrentes =====

function abrirModal() {
    document.getElementById("modalConcorrente").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modalConcorrente").style.display = "none";
}

// Criar competidores


async function criarConcorrente() {
    const input = document.getElementById("nomeCompetidor");
    const nome = input.value.trim();
    const nomeDigitado = nome.toLowerCase();

    if (!nome) {
        await alerta('error', 'Nome do Concorrente não informado', 'Você precisa informar um nome válido.');
        return;
    }

    if (nome.length > 15) {
        await alerta('error', 'Nome do Concorrente ultrapassa 15 caracteres', 'Informe um nome menor ou igual a 15 caracteres.');
        return;
    }

    for (let i = 0; i < nomes.length; i++) {
        if (nomeDigitado === nomes[i].trim().toLowerCase()) {
            await alerta('info', 'Concorrente já cadastrado', 'Este nome de concorrente já existe, tente um novo.');
            return;
        }
    }

    try {
        const data = await apiFetchJson('/api/criar_competidores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoConcorrenteNome: { Name: nome } })
        });

        if (!data) return; // sessão expirada

        await alerta('success', 'Concorrente adicionado com sucesso', 'Você já pode usar o novo concorrente cadastrado.');
        input.value = "";
        fecharModal();
        carregar_concorrentes();

    } catch (err) {
        await alerta('error', 'Erro ao adicionar concorrente', err.message || 'Verifique os dados e tente novamente.');
        console.error(err);
    }
}