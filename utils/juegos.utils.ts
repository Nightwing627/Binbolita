export const calcularParles = (numbers: any) =>{
  let combinations = [];
  if(numbers.length == 2){
    combinations = [numbers[0] + ' '+ numbers[1]];
  }else{
    let a = 0;
    let b = 2;
    let c = 0;
    for(let z = 0; z < numbers.length + 1; z++){      
      for(let l = z; l < z + 1; l++){
        for(let i = c+1; i < numbers.length; i++){
          combinations.push(numbers[c] + ' '+ numbers[i]);
        }
        b++;
        a++;
        c++
      }    
    }
  }
  return combinations
 }


 export const  totalParles = (numeros: any, dinero: any) =>{
    let parles: any = [];
    let totalParles = calcularParles(numeros);
    let dineroApuesta = dinero;
    for(let p of totalParles){
      parles.push({
        parle: p,
        dinero: parseFloat(dineroApuesta) / totalParles.length
      })
    }
    parles = groupAndSum(parles);
    return parles;
  }

  export const  totalParlesDinero = (numeros: any, dinero: any) =>{
    let parles = calcularParles(numeros);
    return { parles, dinero: (parseFloat(dinero) / parles.length) };
  }

  export const  groupAndSum =(array: any)  => {
    return Object.entries(
        array.reduce((acc: any, el: any) => {
            if (el.parle in acc) {
                acc[el.parle] += el.dinero
            } else {
                const key = el.parle.split(' ').reverse().join(' ')
                if (key in acc) acc[key] += el.dinero
                else acc[el.parle] = el.dinero
            }
  
            return acc
        }, {})
    )
    .map(([parle, dinero]) => ({ parle, dinero }))
  }