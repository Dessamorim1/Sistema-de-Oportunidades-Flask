import logging
from unittest import result

from flask import Blueprint, jsonify
from login_required import login_required
from sap_helper import get_sap
from exceptions import SAPError
from tratamento_sap import if_not_ok

logger = logging.getLogger(__name__)

buscar_tipo_itens_blueprint = Blueprint('Buscar_tipo_itens',__name__)

@buscar_tipo_itens_blueprint.route('/api/buscar_tipo_itens')
@login_required
def buscar_tipo_itens():
    try:
        sap = get_sap()
        res = sap.get_endpoint("U_FOC_GRP_PRD",0)
        if_not_ok(res)

        resultado = res.get('data',[])
        logger.info("Tipo dos Itens retornados com sucesso")
        return jsonify(resultado),200
        
    except SAPError:
        raise

    except Exception as e:
        logger.exception(f"Erro interno: {str(e)}")
        return jsonify({"erro": "Erro interno"}), 500
    
