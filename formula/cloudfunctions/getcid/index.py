import pubchempy as pcp
import json


def main(event, context):
    print(event)

    try:
        # 假设这里应该从event字典中获取名为'formula_key'的键对应的值作为参数传递给get_compounds函数
        Option = event['Option']
        Option_key = event['Option_key']
        compond = pcp.get_compounds(Option_key, Option)
        msg = {}
        msg['name'] = compond[0].iupac_name
        msg['cid'] = compond[0].cid
        msg['formula'] = compond[0].molecular_formula
        msg['inchi'] = compond[0].inchi
        msg['smiles'] = compond[0].canonical_smiles
        return msg
    except KeyError as ke:
        print(f"在event字典中未找到指定的键：{ke}")
        return None
    except pcp.ServerError as se:
        print(f"PubChem服务器出现错误：{se}")
        return None
    except Exception as e:
        print(f"发生了其他未知异常：{e}")
        return None