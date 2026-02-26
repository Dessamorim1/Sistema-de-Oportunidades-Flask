import logging

from flask import Blueprint,request,jsonify
from tratamento_sap import if_not_ok
from login_required import login_required
from exceptions import SAPError
from sap_helper import get_sap

logger = logging.getLogger(__name__)

buscar_itens_blueprint = Blueprint('Buscar_itens',__name__)

@buscar_itens_blueprint.route('/api/buscar_itens')
@login_required
def buscar_itens():
    seq_no = request.args.get('seq_no')

    try:
        seq_no_int = int(seq_no)
        if seq_no_int <= 0:
            logger.warning(f"Número da Oportunidade inválido: {seq_no_int}")
            return jsonify({"erro": "Número da oportunidade deve ser maior que zero"}), 400
    except (TypeError, ValueError):
        logger.warning(f"Parâmetro inválido recebido: {seq_no}")
        return jsonify({'erro': 'Número da oportunidade inválido'}), 400

    try:
        sap = get_sap()
        res = sap.get_endpoint(f"U_ITENSPROC?$filter=U_NumOpor eq {seq_no_int}", 0)
        if_not_ok(res)
 
        resultado = res.get('data',[])

        if not resultado:    
            logger.warning("Nenhum item encontrado")
            return jsonify([]), 200

        logger.info("Itens retornados com sucesso")
        return jsonify(resultado), 200
        
    except SAPError:
        raise

    except Exception as e:
        logger.exception(f"Erro interno: {str(e)}")
        return jsonify({"erro": "Erro interno"}), 500