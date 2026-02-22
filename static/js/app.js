window.addEventListener('load', () => {
    gerarLinhasItens(20);
    gerarLinhasConcorrentes(1100);
});

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