import logging

from flask import Blueprint,request,jsonify
from tratamento_sap import if_not_ok
from login_required import login_required
from exceptions import SAPError
from sap_helper import get_sap

logger = logging.getLogger(__name__)

buscar_itens_filtrados_blueprint = Blueprint('Buscar_itens_filtrados',__name__)

@buscar_itens_filtrados_blueprint.route('/api/buscar_itens_filtrados')
@login_required
def buscar_itens_filtrados():
    U_FOC = request.args.get('U_FOC')

    if not U_FOC:
        logger.warning("Parâmetro obrigatório não recebido")
        return jsonify({"erro": "Parâmetro 'U_FOC' é obrigatório"}), 400
    
    try:
        sap = get_sap()
        res = sap.get_endpoint(f"Items?$filter=U_FOC_GRP_PRD eq '{U_FOC}'&$select=ItemCode,ItemName",0)
        if_not_ok(res)

        resultado = res.get('data',[])
    
        if not resultado:         
           logger.warning(f"Nenhum item encontrado para o filtro '{U_FOC}'")
           return jsonify([]), 200
        
        logger.info(f"Itens filtrados pelo código '{U_FOC}' retornados com sucesso!")
        return jsonify(resultado), 200
    
    except SAPError:
        raise
    
    except Exception as e:
        logger.exception(f"Erro ao buscar itens com filtro '{U_FOC}': {str(e)}")
        return jsonify({"erro": "Erro interno ao buscar itens"}), 500
    
