import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function EmployeesSection({ t, employees, employeeForm, onEmployeeInputChange, onCreateEmployee, onDeleteEmployee }) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const toggleBtnRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (showModal) {
        if (modalRef.current && !modalRef.current.contains(e.target) && toggleBtnRef.current && !toggleBtnRef.current.contains(e.target)) {
          setShowModal(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  return (
    <>
      <div className="form-container" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Employees</h2>
          <div>
            <button ref={toggleBtnRef} className="btn btn-primary" onClick={() => setShowModal(prev => !prev)}>
              {showModal ? 'Close' : 'Add Employee'}
            </button>
          </div>
        </div>

        {employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <div className="listings-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>{t('common.action')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.role}</td>
                    <td>
                      <button className="btn btn-small btn-danger" onClick={() => onDeleteEmployee(employee.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="employee-modal-wrapper">
            <div className="modal-overlay" onClick={() => setShowModal(false)} />
            <div className="employee-modal" ref={modalRef} role="dialog" aria-modal="true">
              <form onSubmit={(e) => { onCreateEmployee(e); setShowModal(false); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={employeeForm.name} onChange={onEmployeeInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={employeeForm.email} onChange={onEmployeeInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" value={employeeForm.password} onChange={onEmployeeInputChange} minLength={8} required />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-success">Create Employee</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

EmployeesSection.propTypes = {
  t: PropTypes.func.isRequired,
  employees: PropTypes.array.isRequired,
  employeeForm: PropTypes.object.isRequired,
  onEmployeeInputChange: PropTypes.func.isRequired,
  onCreateEmployee: PropTypes.func.isRequired,
  onDeleteEmployee: PropTypes.func.isRequired
};

export default EmployeesSection;