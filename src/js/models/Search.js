import axios from 'axios';
import { key } from '../config';

export default class Search{
    constructor(query){
        this.query = query;
    }

    async getResults(){
        try{
       const key = `1750ed86acb189eed267f2ff3e6de5fd`;
       const proxy = 'https://cors-anywhere.herokuapp.com/';
       const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
       //console.log(res);
       this.result = res.data.recipes;
       //console.log(this.result);
        }
        catch(err){
    
            alert(`Propably wrong key!\n${err}`);
        }
    
    };


}





