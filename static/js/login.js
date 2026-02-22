function toggleSenha() {
    const input = document.getElementById("senha");
    const icone = document.getElementById("iconeSenha");

    if (input.type === "password") {
        input.type = "text";
        icone.classList.remove("bi-eye-slash");
        icone.classList.add("bi-eye");
    } else {
        input.type = "password";
        icone.classList.remove("bi-eye");
        icone.classList.add("bi-eye-slash");
    }
}