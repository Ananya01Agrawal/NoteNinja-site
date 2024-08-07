const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");




router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    return res
      .status(200)
      .json({ message: "All Notes Fetched Successfully", notes });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      errors: error,
    });
  }
});

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Title shouls be more than 2 characters").isLength({
      min: 3,
    }),
    body("description", "Description must be  10 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: errors,
      });
    }
    try {
      const note = new Notes({ title, description, tag, user: req.user.id });
    
      const savenotes = await note.save();
      return res.status(200).json({
        message: "Note added successfully",
        note: savenotes,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }
);


router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Internal Server Error",
      error: errors,
    });
  }

  try {
    const newnote = {};
    if (title) {
      newnote.title = title;
    }
    if (description) {
      newnote.description = description;
    }
    if (tag) {
      newnote.tag = tag;
    }

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Not Found" });
    }


    if (note.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorised: Not Allowed" });
    }
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newnote },
      { new: true }
    );

    return res.status(200).json({
      message: "Note Updated Successfully",
      note: note,
    });
  } catch (error) {


    return res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
});


// ROUTE 4: Delete any note for loggedIn user using :  DELETE -> "/api/notes/deletenote/:id" . Note: ' Login Required'.
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  //  If there is any error return error 400 status with the error
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Internal Server Error",
      error: errors,
    });
  }
  // Put everything inside the try block so that if any error occur then,
  // we can handle in the catch block
  try {
    // Find the note to be deleted using id given in parameter
    let note = await Notes.findById(req.params.id);
    // If not found return not found error
    if (!note) {
      return res.status(404).json({ message: "Not Found" });
    }
    // Check if the note belongs to the logged in user if not return unauthorised error
    if (note.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorised: Not Allowed" });
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    // return success status 200 with the note message

    return res
      .status(200)
      .json({
        success: true,
        message: "Note deleted successfully",
        note: note,
      });
  } catch (error) {
    // If any error occured then return status 500 with message Internal Server error
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
});

// // ROUTE 5: Get note of user using noteId :  GET -> "/api/notes/fetchnote/:id" . Note: ' Login Required'.
// router.get("/fetchnote/:id", fetchuser, async (req, res) => {
//   // Put everything inside the try block so that if any error occur then,
//   // we can handle in the catch block
//   try {
//     // get all the notes using the user id
//     let note = await Notes.findById(req.params.id);
//     // If not found return not found error
//     if (!note) {
//       return res.status(404).json({ message: "Not Found" });
//     }
//     // Check if the note belongs to the logged in user if not return unauthorised error

//     if (note.user.toString() !== req.user.id) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorised: Not Allowed" });
//     }
//     // return success status 200 with notes message
//     return res
//       .status(200)
//       .json({ message: "Note Fetched Successfully", note });
//   } catch (error) {
//     // If any error occured then return status 500 with message Internal Server error
//     return res.status(500).json({
//       error: "Internal Server Error",
//       errors: error,
//     });
//   }
// });


module.exports = router;
