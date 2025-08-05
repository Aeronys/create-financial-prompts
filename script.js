// Toggle box functionality
function toggleBox(header) {
    const box = header.parentElement;
    const content = box.querySelector('.box-content');
    const chevron = header.querySelector('.chevron');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(0deg)';
    } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(-90deg)';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const categoryDisplay = document.getElementById('categoryDisplay');
    const reportSelectionSection = document.getElementById('reportSelectionSection');
    const reportCountSelect = document.getElementById('reportCount');
    const reportBoxesContainer = document.getElementById('reportBoxesContainer');
    const supportingFactsContainer = document.getElementById('supportingFactsContainer');
    const addFactBtn = document.getElementById('addFactBtn');

    let currentCategory = null;
    let factCounter = 1;

    // Category definitions
    const categories = {
        'A': {
            name: 'Category A - Simple Questions (Single Document)',
            description: 'Questions that can be answered using straightforward facts from a single report.',
            requiresMultipleReports: false
        },
        'B': {
            name: 'Category B - Hard Questions (Single Document)',
            description: 'Questions that require interpreting or calculating information from multiple parts of a single report.',
            requiresMultipleReports: false
        },
        'C': {
            name: 'Category C - Hard Questions (Multiple Documents)',
            description: 'Questions that require comparing or combining information from two or more reports.',
            requiresMultipleReports: true
        }
    };

    // Generate random category
    function generateRandomCategory() {
        const categoryKeys = Object.keys(categories);
        const randomKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        const category = categories[randomKey];
        currentCategory = randomKey;

        // Update display
        let categoryHTML = `
            <div class="category-result">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
        `;

        categoryHTML += '</div>';

        categoryDisplay.innerHTML = categoryHTML;

        // Update category reminder
        updateCategoryReminder(category);

        // Show/hide report selection based on category
        if (category.requiresMultipleReports) {
            reportSelectionSection.style.display = 'block';
            createReportBoxes(parseInt(reportCountSelect.value));
        } else {
            reportSelectionSection.style.display = 'none';
            createReportBoxes(1); // Always create 1 report for categories A and B
        }

        // Initialize supporting facts after category is generated
        initializeSupportingFacts();
    }

    // Initialize supporting facts
    function initializeSupportingFacts() {
        if (supportingFactsContainer && addFactBtn) {
            // Clear any existing facts
            supportingFactsContainer.innerHTML = '';
            
            // Reset counter
            factCounter = 1;
            
            // Add initial supporting fact
            addSupportingFact();
            
            // Add event listener for add button (remove any existing listeners first)
            addFactBtn.removeEventListener('click', addSupportingFact);
            addFactBtn.addEventListener('click', addSupportingFact);
        }
    }

    // Update category reminder
    function updateCategoryReminder(category) {
        const categoryReminder = document.getElementById('categoryReminder');
        
        categoryReminder.innerHTML = `
            <div class="category-reminder-content">
                <strong>Category: ${category.name.split(' - ')[0]}</strong>
            </div>
        `;
    }

    // Generate category automatically when page loads
    generateRandomCategory();

    // Listen for changes in report count (only for Category C)
    reportCountSelect.addEventListener('change', function() {
        if (currentCategory === 'C') {
            createReportBoxes(parseInt(this.value));
        }
    });

    function addSupportingFact() {
        if (!supportingFactsContainer) return;
        
        const factDiv = document.createElement('div');
        factDiv.className = 'supporting-fact';
        factDiv.innerHTML = `
            <div class="fact-header">
                <h4>Supporting Fact #${factCounter}</h4>
            </div>
            <div class="fact-content">
                <div class="fact-input">
                    <label for="fact${factCounter}">Fact:</label>
                    <textarea id="fact${factCounter}" name="fact${factCounter}" rows="2" placeholder="Enter the supporting fact..." required></textarea>
                </div>
                <div class="fact-source">
                    <label for="source${factCounter}">Source:</label>
                    <select id="source${factCounter}" name="source${factCounter}" required>
                        <option value="">Select a report...</option>
                    </select>
                </div>
                <div class="fact-page">
                    <label for="page${factCounter}">Page:</label>
                    <input type="number" id="page${factCounter}" name="page${factCounter}" placeholder="Enter page number..." min="1" step="1" required>
                </div>
                <div class="fact-actions">
                    <button class="remove-fact-btn" ${factCounter === 1 ? 'disabled' : ''}>Remove</button>
                </div>
            </div>
        `;

        supportingFactsContainer.appendChild(factDiv);

        // Populate source dropdown
        populateSourceDropdown(factCounter);

        // Add event listener for remove button
        const removeBtn = factDiv.querySelector('.remove-fact-btn');
        removeBtn.addEventListener('click', function() {
            if (supportingFactsContainer.children.length > 1) {
                // Check if any inputs have data
                const factTextarea = factDiv.querySelector('textarea');
                const sourceSelect = factDiv.querySelector('select');
                const pageInput = factDiv.querySelector('input[type="number"]');
                
                const hasData = (factTextarea && factTextarea.value.trim() !== '') ||
                              (sourceSelect && sourceSelect.value !== '') ||
                              (pageInput && pageInput.value.trim() !== '');
                
                if (hasData) {
                    if (confirm('Are you sure you want to remove this supporting fact?')) {
                        supportingFactsContainer.removeChild(factDiv);
                        updateFactNumbers();
                        updateRemoveButtons();
                    }
                } else {
                    // No data, remove without confirmation
                    supportingFactsContainer.removeChild(factDiv);
                    updateFactNumbers();
                    updateRemoveButtons();
                }
            }
        });

        // Add event listener to prevent decimal input on page numbers
        const pageInput = factDiv.querySelector('input[type="number"]');
        pageInput.addEventListener('input', function() {
            // Remove any decimal places
            if (this.value.includes('.') || this.value.includes(',')) {
                this.value = Math.floor(this.value);
            }
        });

        factCounter++;
        updateRemoveButtons();
    }

    function populateSourceDropdown(factNumber) {
        const sourceSelect = document.getElementById(`source${factNumber}`);
        if (!sourceSelect) return;
        
        sourceSelect.innerHTML = '<option value="">Select a report...</option>';

        // Get all report boxes
        const reportBoxes = document.querySelectorAll('.report-box');
        reportBoxes.forEach((box, index) => {
            const tickerInput = box.querySelector(`#companyTicker${index + 1}`);
            const dateInput = box.querySelector(`#publishDate${index + 1}`);
            const reportTypeRadios = box.querySelectorAll(`input[name="reportType${index + 1}"]`);
            
            let ticker = tickerInput ? tickerInput.value : '';
            let date = dateInput ? dateInput.value : '';
            let reportType = '';
            
            // Get selected report type
            reportTypeRadios.forEach(radio => {
                if (radio.checked) {
                    reportType = radio.value;
                }
            });
            
            // Build the display text
            let displayText = `Report #${index + 1}`;
            
            if (reportType && ticker) {
                displayText += ` - ${reportType} ${ticker}`;
            } else if (reportType) {
                displayText += ` - ${reportType}`;
            } else if (ticker) {
                displayText += ` - ${ticker}`;
            }
            
            if (date) {
                displayText += ` (${date})`;
            }
            
            const option = document.createElement('option');
            option.value = `report${index + 1}`;
            option.textContent = displayText;
            sourceSelect.appendChild(option);
        });
    }

    function updateFactNumbers() {
        const facts = supportingFactsContainer.querySelectorAll('.supporting-fact');
        facts.forEach((fact, index) => {
            const header = fact.querySelector('h4');
            header.textContent = `Supporting Fact #${index + 1}`;
            
            // Update IDs and names
            const factTextarea = fact.querySelector('textarea');
            const sourceSelect = fact.querySelector('select');
            const pageInput = fact.querySelector('input[type="number"]');
            
            const newNumber = index + 1;
            factTextarea.id = `fact${newNumber}`;
            factTextarea.name = `fact${newNumber}`;
            sourceSelect.id = `source${newNumber}`;
            sourceSelect.name = `source${newNumber}`;
            pageInput.id = `page${newNumber}`;
            pageInput.name = `page${newNumber}`;
        });
    }

    function updateRemoveButtons() {
        const facts = supportingFactsContainer.querySelectorAll('.supporting-fact');
        const removeButtons = supportingFactsContainer.querySelectorAll('.remove-fact-btn');
        
        removeButtons.forEach((btn) => {
            btn.disabled = facts.length === 1;
        });
    }

    function createReportBoxes(count) {
        // Clear existing boxes
        reportBoxesContainer.innerHTML = '';

        // Create new boxes
        for (let i = 1; i <= count; i++) {
            const reportBox = createReportBox(i);
            reportBoxesContainer.appendChild(reportBox);
        }

        // Update source dropdowns for existing facts
        updateAllSourceDropdowns();
    }

    function updateAllSourceDropdowns() {
        const facts = supportingFactsContainer.querySelectorAll('.supporting-fact');
        facts.forEach((fact, index) => {
            populateSourceDropdown(index + 1);
        });
    }

    function createReportBox(reportNumber) {
        const box = document.createElement('div');
        box.className = 'evaluation-box report-box';
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        box.innerHTML = `
            <div class="box-header" onclick="toggleBox(this)">
                <h2>Report ${reportNumber}</h2>
                <span class="chevron">▼</span>
            </div>
            <div class="box-content">
                <div>
                    <p>Report Type:</p>
                    <div class="radio-options">
                        <label><input type="radio" name="reportType${reportNumber}" value="10K">10-K</label>
                        <label><input type="radio" name="reportType${reportNumber}" value="10Q">10-Q</label>
                    </div>
                </div>
                <div>
                    <p>Company Ticker:</p>
                    <input type="text" name="companyTicker${reportNumber}" id="companyTicker${reportNumber}">
                </div>
                <div>
                    <p>Direct Link to Report:</p>
                    <input type="url" name="reportLink${reportNumber}" id="reportLink${reportNumber}" placeholder="https://www.sec.gov/Archives/edgar/data/...">
                    <small>Open it as HTML first. The link must begin with https://www.sec.gov/Archives/edgar/data.</small>
                </div>
                <div>
                    <p>Date Published:</p>
                    <input type="date" name="publishDate${reportNumber}" id="publishDate${reportNumber}" min="2023-10-01" max="${today}" required>
                    <small>Must be from October 2023 or later, and cannot be in the future</small>
                    <div class="error-message" id="dateError${reportNumber}"></div>
                </div>
                <div>
                    <p>Upload Report (PDF):</p>
                    <input type="file" name="reportPdf${reportNumber}" id="reportPdf${reportNumber}" accept=".pdf" required>
                </div>
            </div>
        `;

        // Add event listener for date validation
        const dateInput = box.querySelector(`#publishDate${reportNumber}`);
        const errorDiv = box.querySelector(`#dateError${reportNumber}`);
        
        // Add event listeners for validation
        dateInput.addEventListener('change', function() {
            validateDate(this, errorDiv);
        });

        dateInput.addEventListener('blur', function() {
            validateDate(this, errorDiv);
        });

        // Add event listeners for updating source dropdowns
        const tickerInput = box.querySelector(`#companyTicker${reportNumber}`);
        const reportTypeRadios = box.querySelectorAll(`input[name="reportType${reportNumber}"]`);
        
        tickerInput.addEventListener('input', updateAllSourceDropdowns);
        dateInput.addEventListener('change', updateAllSourceDropdowns);
        
        // Add event listeners for report type radio buttons
        reportTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateAllSourceDropdowns);
        });

        return box;
    }

    function validateDate(dateInput, errorDiv) {
        const selectedDate = new Date(dateInput.value);
        const minDate = new Date('2023-10-01');
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today
        
        // Clear previous error
        errorDiv.style.display = 'none';
        dateInput.style.borderColor = '#ced4da';
        dateInput.classList.remove('error');
        
        if (dateInput.value) {
            if (selectedDate < minDate) {
                errorDiv.textContent = 'Date must be from October 2023 or later';
                errorDiv.style.display = 'block';
                dateInput.style.borderColor = '#dc3545';
                dateInput.classList.add('error');
                dateInput.setCustomValidity('Date must be from October 2023 or later');
            } else if (selectedDate > today) {
                errorDiv.textContent = 'Date cannot be in the future';
                errorDiv.style.display = 'block';
                dateInput.style.borderColor = '#dc3545';
                dateInput.classList.add('error');
                dateInput.setCustomValidity('Date cannot be in the future');
            } else {
                dateInput.setCustomValidity('');
            }
        } else {
            dateInput.setCustomValidity('');
        }
    }

    // Submit button validation
    const submitBtn = document.getElementById('submitBtn');
    const validationErrors = document.getElementById('validationErrors');

    submitBtn.addEventListener('click', function() {
        const errors = [];
        
        // Clear previous errors
        validationErrors.innerHTML = '';
        clearAllErrorMessages();

        // Check report boxes
        const reportBoxes = document.querySelectorAll('.report-box');
        reportBoxes.forEach((box, index) => {
            const reportNumber = index + 1;
            
            // Check report type
            const reportTypeRadios = box.querySelectorAll(`input[name="reportType${reportNumber}"]`);
            const reportTypeSelected = Array.from(reportTypeRadios).some(radio => radio.checked);
            if (!reportTypeSelected) {
                showError(`#reportType${reportNumber}`, 'Please select a report type (10-K or 10-Q)');
                errors.push(`Report ${reportNumber}: Please select a report type (10-K or 10-Q)`);
            }

            // Check company ticker
            const tickerInput = box.querySelector(`#companyTicker${reportNumber}`);
            if (!tickerInput.value.trim()) {
                showError(`#companyTicker${reportNumber}`, 'Please enter a company ticker');
                errors.push(`Report ${reportNumber}: Please enter a company ticker`);
            }

            // Check date
            const dateInput = box.querySelector(`#publishDate${reportNumber}`);
            if (!dateInput.value) {
                showError(`#publishDate${reportNumber}`, 'Please select a publish date');
                errors.push(`Report ${reportNumber}: Please select a publish date`);
            } else if (dateInput.classList.contains('error')) {
                errors.push(`Report ${reportNumber}: Please fix the date error`);
            }

            // Check PDF file
            const pdfInput = box.querySelector(`#reportPdf${reportNumber}`);
            if (!pdfInput.files || pdfInput.files.length === 0) {
                showError(`#reportPdf${reportNumber}`, 'Please upload a PDF file');
                errors.push(`Report ${reportNumber}: Please upload a PDF file`);
            }
        });

        // Check financial prompt
        const financialPrompt = document.getElementById('financialPrompt');
        if (!financialPrompt.value.trim()) {
            showError('#financialPrompt', 'Please enter a financial prompt');
            errors.push('Please enter a financial prompt');
        }

        // Check correct answer
        const correctAnswer = document.getElementById('correctAnswer');
        if (!correctAnswer.value.trim()) {
            showError('#correctAnswer', 'Please enter a correct answer');
            errors.push('Please enter a correct answer');
        }

        // Check supporting facts
        const supportingFacts = document.querySelectorAll('.supporting-fact');
        supportingFacts.forEach((fact, index) => {
            const factNumber = index + 1;
            
            // Check fact text
            const factTextarea = fact.querySelector('textarea');
            if (!factTextarea.value.trim()) {
                showError(`#${factTextarea.id}`, 'Please enter the fact');
                errors.push(`Supporting Fact ${factNumber}: Please enter the fact`);
            }

            // Check source
            const sourceSelect = fact.querySelector('select');
            if (!sourceSelect.value) {
                showError(`#${sourceSelect.id}`, 'Please select a source');
                errors.push(`Supporting Fact ${factNumber}: Please select a source`);
            }

            // Check page
            const pageInput = fact.querySelector('input[type="number"]');
            if (!pageInput.value.trim()) {
                showError(`#${pageInput.id}`, 'Please enter a page number');
                errors.push(`Supporting Fact ${factNumber}: Please enter a page number`);
            } else if (pageInput.value.includes('.') || pageInput.value.includes(',')) {
                showError(`#${pageInput.id}`, 'Page number must be a whole number');
                errors.push(`Supporting Fact ${factNumber}: Page number must be a whole number`);
            }
        });

        // Check reasoning
        const reasoning = document.getElementById('reasoning');
        if (!reasoning.value.trim()) {
            showError('#reasoning', 'Please enter your reasoning');
            errors.push('Please enter your reasoning');
        }

        // Display general error message if any errors exist
        if (errors.length > 0) {
            const generalError = document.createElement('div');
            generalError.className = 'validation-error';
            generalError.textContent = `Please fix ${errors.length} error${errors.length > 1 ? 's' : ''} before submitting.`;
            validationErrors.appendChild(generalError);
            
            // Scroll to first error
            const firstError = document.querySelector('.input-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // All validations passed
            alert('All fields are complete! Form is ready to submit.');
        }
    });

    // Function to show error under specific input
    function showError(selector, message) {
        const element = document.querySelector(selector);
        if (!element) return;

        // Remove existing error message
        const existingError = element.parentNode.querySelector('.input-error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error styling to input
        element.classList.add('input-error');
        element.style.borderColor = '#dc3545';

        // Create and insert error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '11px';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.marginBottom = '15px';
        errorDiv.style.padding = '4px 8px';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.border = '1px solid #f5c6cb';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.display = 'block';

        // Insert after the input element
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    }

    // Function to clear all error messages
    function clearAllErrorMessages() {
        // Remove all error messages
        const errorMessages = document.querySelectorAll('.input-error-message');
        errorMessages.forEach(msg => msg.remove());

        // Remove error styling from inputs
        const errorInputs = document.querySelectorAll('.input-error');
        errorInputs.forEach(input => {
            input.classList.remove('input-error');
            input.style.borderColor = '#ced4da';
        });
    }
}); 