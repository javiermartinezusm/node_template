import Router from 'koa-router'
import getHealth from './health/health'

const router = new Router()
const promotion_rules = [
    {
    rule : "Nx$",
    discount_percentage : 20,
    n : 4
    },
    {
    rule : "AyA",
    discount_percentage : 15,
    n : 1
    }
]

router.get('/health', getHealth)
router.post('/api/get-promotion',(ctx, next) => {
    // handle your post request here
    ctx.body = ctx.request.body;
    let aux = {
        'status' : 'OK',
        'cart_id' : ctx.body['cart_id'],
        'details' : []
    }
    let input_error=0
    for (let i = 0; i < ctx.body['items'].length; i++) {
        let item = ctx.body['items'][i];
        let total_price =0;
        let promotion_applied = 'false'
        if(item['promotion']=="Nx$"){
            let quotient = Math.floor(item['amount']/promotion_rules[0]['n'])
            let remainder = item['amount']%promotion_rules[0]['n']
            if(quotient>0){
                total_price = item['unit_base_price']*(quotient*promotion_rules[0]['n']*(1-promotion_rules[0]['discount_percentage']/100)+remainder)
                promotion_applied = 'true'
            }
            else{
                total_price = item['unit_base_price']*item['amount']
                promotion_applied = 'false'
            }
        }
        else if(item['promotion']=="AyA"){
            total_price=item['amount']*(1-promotion_rules[1]['discount_percentage']/100)*item['unit_base_price']
            promotion_applied = 'true'
        }
        else if(item['promotion']==""){
            total_price=item['amount']*item['unit_base_price']
            promotion_applied = 'false'
        }
        else{
            input_error=1
            break
        }
        if(total_price<=0){
            input_error=2
            break
        }
        aux['details'].push({'item_id': item['item_id'], 'amount' : item['amount'], 'total_price' : total_price, 'promotion_applied': promotion_applied})
    }
    if(input_error==0){
        ctx.body=aux;
        ctx.status=200;
    } else if (input_error==1){
        ctx.status=400
        ctx.body={'status' : 'NOK', 'error_message': "RULE DOES NOT EXIST"}
    } else if (input_error==2){
        ctx.status=400
        ctx.body={'status' : 'NOK', 'error_message': "AMOUNT OR PRICE SHOULD BE GREATER THAN ZERO"}
    }
    return ctx
  })
export default router
