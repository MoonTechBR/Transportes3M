document.addEventListener("DOMContentLoaded", () => {
    // Número principal oficial da 3M extraído do cartão
    const WHATSAPP_NUMBER = "5511993977895"; 

    const serviceCards = document.querySelectorAll(".add-to-cart-btn");
    const quoteModal = document.getElementById("quote-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const sendWhatsappBtn = document.getElementById("send-whatsapp-btn");
    const selectedServiceTitle = document.getElementById("selected-service-title");

    let currentSelectedService = "";

    // Função de Busca de CEP via API ViaCEP
    const buscarCEP = async (cepInputId, addressInputId) => {
        const cepInput = document.getElementById(cepInputId);
        const addressInput = document.getElementById(addressInputId);
        let cep = cepInput.value.replace(/\D/g, ''); 

        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    addressInput.value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                } else {
                    Toastify({
                        text: "CEP não encontrado. Digite manualmente.",
                        duration: 3000,
                        style: { background: "#FFCC00", color: "#000", fontWeight: "bold" }
                    }).showToast();
                }
            } catch (error) {
                console.error("Erro na API ViaCEP:", error);
            }
        }
    };

    // Disparadores automáticos ao digitar o CEP
    document.getElementById("cep-origin").addEventListener("input", (e) => {
        let cep = e.target.value.replace(/\D/g, '');
        if(cep.length === 8) buscarCEP("cep-origin", "origin");
    });
    document.getElementById("cep-destination").addEventListener("input", (e) => {
        let cep = e.target.value.replace(/\D/g, '');
        if(cep.length === 8) buscarCEP("cep-destination", "destination");
    });

    // Abrir Modal
    serviceCards.forEach(card => {
        card.addEventListener("click", (e) => {
            currentSelectedService = e.currentTarget.getAttribute("data-name");
            selectedServiceTitle.textContent = `Orçamento: ${currentSelectedService}`;
            resetForm();
            quoteModal.classList.remove("hidden");
        });
    });

    // Fechar Modal
    closeModalBtn.addEventListener("click", () => quoteModal.classList.add("hidden"));
    quoteModal.addEventListener("click", (e) => {
        if (e.target === quoteModal) quoteModal.classList.add("hidden");
    });

    // Controle dos Contadores Dinâmicos
    const counterBtns = document.querySelectorAll(".counter-btn");
    counterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const action = e.target.getAttribute("data-action");
            const targetId = e.target.getAttribute("data-target");
            const countElement = document.getElementById(targetId);
            
            if(countElement) {
                let currentCount = parseInt(countElement.textContent);

                if (action === "plus") {
                    currentCount++;
                } else if (action === "minus" && currentCount > 0) {
                    currentCount--;
                }
                countElement.textContent = currentCount;
            }
        });
    });

    // Montagem e Envio para WhatsApp
    sendWhatsappBtn.addEventListener("click", () => {
        // RESTAURADO: Captura exata do endereço + Número (igual Rick Transportes)
        const origin = document.getElementById("origin").value.trim();
        const numOrigin = document.getElementById("num-origin").value.trim();
        const destination = document.getElementById("destination").value.trim();
        const numDestination = document.getElementById("num-destination").value.trim();
        
        const accessType = document.getElementById("access-type").value;
        const packing = document.getElementById("packing").value;
        const storage = document.getElementById("storage").value;
        const extraItems = document.getElementById("extra-items").value.trim();

        // Validação de segurança
        if (!origin || !destination) {
            Toastify({
                text: "⚠️ Preencha a Rua/Bairro de Retirada e Entrega!",
                duration: 3500,
                close: true,
                gravity: "top",
                position: "center",
                style: { background: "#E60000", color: "#fff", fontWeight: "bold" }
            }).showToast();
            return;
        }

        if (!accessType) {
            Toastify({
                text: "⚠️ Informe o tipo de acesso (Escadas/Elevador).",
                duration: 3500,
                close: true,
                gravity: "top",
                position: "center",
                style: { background: "#E60000", color: "#fff", fontWeight: "bold" }
            }).showToast();
            return;
        }

        // RESTAURADO: Lista completa de itens para o array (Igual Rick Transportes)
        let inventoryText = "";
        const items = [
            { id: "item-geladeira", label: "Geladeira(s)" },
            { id: "item-fogao", label: "Fogão" },
            { id: "item-maquina", label: "Máquina de Lavar" },
            { id: "item-sofa", label: "Sofá(s)" },
            { id: "item-rack", label: "Rack(s)" },
            { id: "item-painel", label: "Painel de TV" },
            { id: "item-mesa", label: "Mesa(s)" },
            { id: "item-cama", label: "Cama(s)" },
            { id: "item-colchao", label: "Colchão" },
            { id: "item-armario", label: "Guarda-Roupa(s)" },
            { id: "item-caixas", label: "Caixas/Sacos (Aprox.)" }
        ];

        items.forEach(item => {
            const countElement = document.getElementById(item.id);
            if (countElement) {
                const count = parseInt(countElement.textContent);
                if (count > 0) {
                    inventoryText += `🔹 ${count}x ${item.label}\n`;
                }
            }
        });

        // Formatação do Endereço Completo (Tratando se o cliente não colocou o número)
        const fullOrigin = numOrigin ? `${origin}, N° ${numOrigin}` : origin;
        const fullDestination = numDestination ? `${destination}, N° ${numDestination}` : destination;

        // Estruturação Final da Mensagem
        let message = `*NOVO ORÇAMENTO - 3M TRANSPORTES* 🚚\n\n`;
        message += `*Serviço:* ${currentSelectedService}\n`;
        message += `📍 *Retirada:* ${fullOrigin}\n`;
        message += `🏁 *Entrega:* ${fullDestination}\n`;
        message += `🏢 *Acesso/Imóvel:* ${accessType}\n\n`;
        
        message += `*SERVIÇOS ESPECIAIS 3M:*\n`;
        message += `📦 *Embalagem:* ${packing}\n`;
        message += `🏭 *Armazenamento:* ${storage}\n\n`;

        message += `*INVENTÁRIO PRINCIPAL:*\n`;
        if (inventoryText === "" && !extraItems) {
            message += `_Apenas itens miúdos ou não informados._\n`;
        } else {
            message += inventoryText;
            if (extraItems) message += `\n*Outros/Avisos:* ${extraItems}\n`;
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");
        quoteModal.classList.add("hidden");
    });

    // Limpeza de cache de formulário
    function resetForm() {
        document.querySelectorAll("input[type='text']").forEach(input => input.value = "");
        document.getElementById("access-type").value = "";
        
        const packingEl = document.getElementById("packing");
        if(packingEl) packingEl.value = "Com Embalagem e Encaixotamento";
        
        const storageEl = document.getElementById("storage");
        if(storageEl) storageEl.value = "Direto para o destino";
        
        document.querySelectorAll(".item-count").forEach(span => span.textContent = "0");
    }

    // Identificador Visual de Expediente
    const updateStatusBadge = () => {
        const badge = document.getElementById("status-badge");
        const statusText = document.getElementById("status-text");
        
        const now = new Date();
        const day = now.getDay(); 
        const hour = now.getHours();

        let isOpen = false;

        // Seg a Sex (8h às 18h) | Sábados (8h às 14h)
        if (day >= 1 && day <= 5) { 
            if (hour >= 8 && hour < 18) isOpen = true;
        } else if (day === 6) { 
            if (hour >= 8 && hour < 14) isOpen = true;
        }

        if (isOpen) {
            badge.classList.add("border-green-500/50");
            badge.classList.remove("border-red-500/50");
            statusText.textContent = "🟢 Aberto Agora";
            statusText.classList.replace("text-brand-yellow", "text-green-400");
            statusText.classList.replace("text-red-400", "text-green-400");
        } else {
            badge.classList.add("border-red-500/50");
            badge.classList.remove("border-green-500/50");
            statusText.textContent = "🔴 Fechado (Mande msg e aguarde)";
            statusText.classList.replace("text-brand-yellow", "text-red-400");
            statusText.classList.replace("text-green-400", "text-red-400");
        }
    };

    updateStatusBadge();
});
