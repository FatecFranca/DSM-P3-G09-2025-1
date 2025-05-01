// Função para validar a sessão
export function validarSessao(req){
    if (req.session.usuario){
        return true;
    }else{
        return false;
    }
}