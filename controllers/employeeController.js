const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');

// @desc    Get all employees
// @route   GET /api/v1/employees
// @access  Private
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      data: employees,
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Create new employee
// @route   POST /api/v1/employees
// @access  Private
const createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !position || !salary || !date_of_joining || !department) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlink(path.join('./uploads', req.file.filename), (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      
      return res.status(400).json({
        status: false,
        message: 'All fields are required: first_name, last_name, email, position, salary, date_of_joining, department',
      });
    }

    // Check if employee already exists
    const employeeExists = await Employee.findOne({ email });

    if (employeeExists) {
      // Delete uploaded file if employee exists
      if (req.file) {
        fs.unlink(path.join('./uploads', req.file.filename), (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      
      return res.status(400).json({
        status: false,
        message: 'Employee already exists with this email',
      });
    }

    // Create employee data
    const employeeData = {
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department,
    };

    // Add profile picture if uploaded
    if (req.file) {
      employeeData.profile_picture = req.file.filename;
    }

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      message: 'Employee created successfully',
      employee_id: employee._id,
    });
  } catch (error) {
    console.error('Create employee error:', error);

    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlink(path.join('./uploads', req.file.filename), (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Get employee by ID
// @route   GET /api/v1/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      status: true,
      data: employee,
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        status: false,
        message: 'Invalid employee ID',
      });
    }

    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
// @access  Private
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      // Delete uploaded file if employee not found
      if (req.file) {
        fs.unlink(path.join('./uploads', req.file.filename), (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }

      return res.status(404).json({
        status: false,
        message: 'Employee not found',
      });
    }

    // Update fields
    const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;

    if (first_name) employee.first_name = first_name;
    if (last_name) employee.last_name = last_name;
    if (email) employee.email = email;
    if (position) employee.position = position;
    if (salary) employee.salary = salary;
    if (date_of_joining) employee.date_of_joining = date_of_joining;
    if (department) employee.department = department;

    // Handle profile picture update
    if (req.file) {
      // Delete old profile picture if exists
      if (employee.profile_picture) {
        const oldImagePath = path.join('./uploads', employee.profile_picture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Error deleting old file:', err);
          });
        }
      }
      employee.profile_picture = req.file.filename;
    }

    await employee.save();

    res.status(200).json({
      message: 'Employee details updated successfully',
    });
  } catch (error) {
    console.error('Update employee error:', error);

    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlink(path.join('./uploads', req.file.filename), (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: false,
        message: messages[0],
      });
    }

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        status: false,
        message: 'Invalid employee ID',
      });
    }

    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
// @access  Private
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: 'Employee not found',
      });
    }

    // Delete profile picture if exists
    if (employee.profile_picture) {
      const imagePath = path.join('./uploads', employee.profile_picture);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        status: false,
        message: 'Invalid employee ID',
      });
    }

    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Search employees by department and/or position
// @route   GET /api/v1/employees/search
// @access  Private
const searchEmployees = async (req, res) => {
  try {
    const { department, position } = req.query;

    // Build search query
    const searchQuery = {};

    if (department) {
      searchQuery.department = { $regex: department, $options: 'i' }; // Case-insensitive
    }

    if (position) {
      searchQuery.position = { $regex: position, $options: 'i' }; // Case-insensitive
    }

    // If no search parameters provided
    if (!department && !position) {
      return res.status(400).json({
        status: false,
        message: 'Please provide department or position to search',
      });
    }

    const employees = await Employee.find(searchQuery).sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
};
