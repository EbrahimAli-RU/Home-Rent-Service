const axios = require('axios');
// const main = require('./../public/js/main');
exports.getHomePage = async(req, res) => {
    res.status(200).render('index');
}

exports.rentalService = (req, res) => { 
    console.log(req.query);
        axios({
            method: 'get',
            url: 'http://127.0.0.1:8000/api/v1/rental'
        }).then(res1 => {
            res.status(200).render('RentalService');
        }).catch(err => {
            console.log(err);
            console.log('Ebrahim')
        })
        
    
}