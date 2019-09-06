import uniqid from 'uniqid'

export default class List{
    constructor(){
        this.items = [];

    }

    addItem(count, unit, ingredient){

        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient

        };

        this.items.push(item);
        return item;        
    }

    deleteItem(id){
        const index = this.items.findIndex(el => el.id === id);
        // e.g. [2,4,6], splice(1,1) // (start, how_many)// --> ret 4, original arr: [2,6];
        // [2,4,6], slice(1,2) // (start,end) //--> ret 4, original arr: [2,4,6]; 
        this.items.splice(index, 1); // this.items.splice(index, index+1) 

    }

    updateCount(id, newCount){
        try{
        this.items.find(el => el.id === id).count = newCount;
        }
        catch(err){
            console.log('Cannot find the object with that id!');
        }

    }


};