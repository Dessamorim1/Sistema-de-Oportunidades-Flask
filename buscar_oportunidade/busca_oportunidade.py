import logging

from flask import Blueprint,request,jsonify
from tratamento_sap import if_not_ok
from login_required import login_required
from exceptions import SAPError
from sap_helper import get_sap

logger = logging.getLogger(__name__)

buscar_oportunidade_blueprint = Blueprint('Buscar_oportunidade',__name__)

@buscar_oportunidade_blueprint.route('/api/buscar_oportunidade')
@login_required
def buscar_opor():
    seq_no = request.args.get('seq_no')

    try:
        seq_no_int = int(seq_no)
        if seq_no_int<=0:
            logger.warning(f"Número da Oportunidade inválido: {seq_no_int}")
            return jsonify({"erro": "Número de oportunidade deve ser maior que zero"}), 400
    except (TypeError,ValueError):
        logger.warning(f"Parâmetro inválido recebido: {seq_no}")
        return jsonify({'erro': 'Número da oportunidade inválido'}), 400
    
    try:    
        sap = get_sap()   
        endpoint = (
            "SalesOpportunities"
            f"?$filter=SequentialNo eq {seq_no_int}"
            "&$select="
            "CardCode,"
            "CustomerName,"
            "OpportunityName,"
            "StartDate,"
            "PredictedClosingDate,"
            "MaxLocalTotal,"
            "SalesPerson,"
            "Status,"
            "U_Modalidade,"
            "U_Esfera,"
            "U_NumLicitacao,"
            "SalesOpportunitiesCompetition"
        )
        resp = sap.get_endpoint(endpoint)
        if_not_ok(resp)

        resultado = resp.get('data',[])
        if not resultado:
            logger.error(f"Oportunidade {seq_no_int} não encontrada")
            return jsonify({"erro" : "Oportunidade não encontrada"}),404
        
        logger.info(f"Oportunidade Buscada {seq_no_int} com sucesso!")
        return jsonify(resultado),200

    except SAPError:
        raise
    
    except Exception as e:
        logger.exception("Erro interno ao buscar oportunidade")
        return jsonify({"erro": str(e)}), 500
  
