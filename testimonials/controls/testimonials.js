const mongoose = require('mongoose')
const axios = require('axios')
const Testimonials = mongoose.model("Testimonials");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports ={
        
    post: async (req, res)=> {
        try{
            const data = {
                name: DOMPurify.sanitize(req.body.name) || 'Anonymous',
                body: DOMPurify.sanitize(req.body.body),
            }

            // get a random avatar

            if(!data.body){
                return res.status(400).json({ status: false, msg: "Message is required!"})
            }

            // save to the database
            const newData = new Testimonials({
                name: data.name,
                body: data.body,
            })

            await newData.save();

            return res.status(200).json({ status: true, msg: "Thank you for your feedback", data: newData})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    get: async (req, res)=> {
        try{
            const {id} = req.params;

            const data = await Testimonials.findOne({_id: id});
            return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getAll: async (req, res)=> {
        try{
            const data = await Testimonials.find({});
            return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getSelected: async (req, res)=> {
        try{
               const data = await Testimonials.find({removed: false}).sort({createdAt: -1});
            
               return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    restrict: async (req, res)=> {
        try{
            const {id} = req.params;
            // find the collection with this id and update the remove status to be false
            const data = await Testimonials.findByIdAndUpdate({_id: id}, {$set: {
                removed: true
            }}, {new: true});

            return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    delete: async (req, res)=> {
        try{
            // find the collection with this id and update the remove status to be false
            const {id} = req.params
            const data = await Testimonials.findByIdAndRemove({_id: id});
            
            return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    deleteAll: async (req, res)=> {
        try{
               const data = await Testimonials.deleteAll({})
               return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

}