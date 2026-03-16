// script-cliente.js

document.addEventListener('DOMContentLoaded', function() {
    const formAgendamento = document.getElementById('formAgendamento');
    const mensagemSucesso = document.getElementById('mensagemSucesso');

    formAgendamento.addEventListener('submit', function(event) {
        // Previne que a página recarregue ao enviar o formulário
        event.preventDefault();

        // Aqui, em um sistema real, você enviaria os dados para o banco de dados (Backend)
        
        // Simulação visual de sucesso:
        // 1. Oculta o formulário
        formAgendamento.classList.add('d-none');
        
        // 2. Mostra a mensagem de sucesso
        mensagemSucesso.classList.remove('d-none');
        
        // Simulação extra: Rola a tela para o topo para o usuário ler a mensagem
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});