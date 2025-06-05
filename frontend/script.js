document.addEventListener('DOMContentLoaded', function () {
  // **1. Handle Job Application Form Submission**
  const applicationForm = document.getElementById('application-form');
  const applicationsContainer = document.getElementById('applications-container');

  if (applicationForm) {
    console.log("Application form found. Adding event listener.");
    applicationForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent page reload

      const coverLetter = document.getElementById('cover-letter').value.trim();
      const resume = document.getElementById('resume').files[0];

      if (!coverLetter || !resume) {
        alert('Please provide a cover letter and upload your resume.');
        return;
      }

      const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      if (!allowedFileTypes.includes(resume.type)) {
        alert('Only PDF, DOC, and DOCX file types are allowed.');
        return;
      }

      if (resume.size > maxFileSize) {
        alert('File size must not exceed 5MB.');
        return;
      }

      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resume);

      const loadingMessage = document.getElementById('loading-message');
      if (loadingMessage) {
        loadingMessage.style.display = 'block';
      }

      fetch(`http://localhost:3000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (loadingMessage) {
            loadingMessage.style.display = 'none';
          }

          if (data.success) {
            alert('Application submitted successfully!');
            applicationForm.reset();
          } else {
            alert(data.message || 'Failed to submit application.');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          if (loadingMessage) {
            loadingMessage.style.display = 'none';
          }
          alert('An error occurred while submitting the application. Please try again.');
        });
    });
  } else {
    console.log('Application form element not found!');
  }

  // **2. Fetch Submitted Applications**
  if (applicationsContainer) {
    console.log("Applications container found. Fetching applications.");
    function fetchApplications() {
      applicationsContainer.innerHTML = '<p>Loading...</p>'; // Show loading indicator

      fetch('http://localhost:3000/api/jobs/applications')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          applicationsContainer.innerHTML = ''; // Clear loading indicator
          if (data.success && data.applications.length > 0) {
            data.applications.forEach((application) => {
              const applicationElement = document.createElement('div');
              applicationElement.classList.add('application');

              applicationElement.innerHTML = `
                <h3>${application.applicantName}</h3>
                <p><strong>Cover Letter:</strong> ${application.coverLetter}</p>
                <a href="${application.resumeURL}" target="_blank">View Resume</a>
              `;
              applicationsContainer.appendChild(applicationElement);
            });
          } else {
            applicationsContainer.innerHTML = '<p>No applications found.</p>';
          }
        })
        .catch((error) => {
          console.error('Error fetching applications:', error);
          applicationsContainer.innerHTML = '<p>Failed to load applications. Please try again later.</p>';
        });
    }

    fetchApplications();
  } else {
    console.log('Applications container not found!');
  }
});

// // **3. Registration and Login with Fetch API**
// const baseURL = "http://localhost:3000";

// document.addEventListener("DOMContentLoaded", function () {
//   // **Handle Registration**
//   const registerForm = document.getElementById("registerForm");
//   if (registerForm) {
//     console.log("Register form found. Adding event listener.");
//     registerForm.addEventListener("submit", async function (event) {
//       event.preventDefault();

//       const name = document.getElementById("name").value.trim();
//       const email = document.getElementById("email").value.trim();
//       const password = document.getElementById("password").value.trim();
//       const confirmPassword = document.getElementById("confirm-password").value.trim();
//       const role = document.getElementById("role").value;

//       if (password !== confirmPassword) {
//         alert("Passwords do not match!");
//         return;
//       }

//       try {
//         const response = await fetch(`${baseURL}/api/auth/register`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ name, email, password, role }),
//         });

//         const data = await response.json();
//         if (data.success) {
//           alert("Registration successful! Please log in.");
//           window.location.href = "login.html";
//         } else {
//           alert(data.message || "Registration failed.");
//         }
//       } catch (error) {
//         console.error("Registration error:", error);
//       }
//     });
//   } else {
//     console.log('Register form element not found!');
//   }

//   // **Handle Login**
//   const loginForm = document.getElementById("loginForm");
//   if (loginForm) {
//     console.log("Login form found. Adding event listener.");
//     loginForm.addEventListener("submit", async function (event) {
//       event.preventDefault();

//       const email = document.getElementById("email").value.trim();
//       const password = document.getElementById("password").value.trim();

//       try {
//         const response = await fetch(`${baseURL}/api/auth/login`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, password }),
//         });

//         const data = await response.json();
//         if (data.success) {
//           localStorage.setItem("token", data.token); // Store JWT
//           alert("Login successful!");
//           window.location.href = "profile.html";
//         } else {
//           alert(data.message || "Login failed.");
//         }
//       } catch (error) {
//         console.error("Login error:", error);
//       }
//     });
//   } else {
//     console.log('Login form element not found!');
//   }
// });
// **3. Registration and Login with Fetch API** 
const baseURL = "http://localhost:3000";

// document.addEventListener('DOMContentLoaded', function () {
//     const jobTitleElement = document.getElementById('job-title');
//     if (!jobTitleElement) {
//         console.error('Element with ID "job-title" not found in the HTML.');
//         return;
//     }
//     // Get job ID from URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const jobId = urlParams.get('jobId');

//     if (!jobId) {
//         document.getElementById('job-title').textContent = 'Invalid job ID.';
//         return;
//     }

//     // Fetch job details from backend
//     fetch(`http://localhost:3000/api/jobs/${jobId}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.success && data.job) {
//                 const job = data.job;
//                 document.getElementById('job-title').textContent = job.title;
//                 document.getElementById('job-company').textContent = job.company;
//                 document.getElementById('job-location').textContent = job.location;
//                 document.getElementById('job-salary').textContent = job.salary;
//                 document.getElementById('job-description').textContent = job.description;
//             } else {
//                 document.getElementById('job-title').textContent = 'Job not found';
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching job details:', error);
//             document.getElementById('job-title').textContent = 'Failed to load job details';
//         });

//     // Handle job application submission
//     const applicationForm = document.getElementById('application-form');
//     if (applicationForm) {
//         applicationForm.addEventListener('submit', function (event) {
//             event.preventDefault(); // Prevent page refresh

//             const coverLetter = document.getElementById('cover-letter').value;
//             const resume = document.getElementById('resume').files[0];

//             if (!coverLetter || !resume) {
//                 alert('Please provide a cover letter and upload your resume.');
//                 return;
//             }

//             const token = localStorage.getItem('authToken');

//             if (!token) {
//                 // Store the job page URL before redirecting
//                 localStorage.setItem('redirectAfterLogin', window.location.href);
//                 alert('You need to log in to apply for jobs.');
//                 window.location.href = 'login.html'; // Redirect to login
//                 return;
//             }

//             const formData = new FormData();
//             formData.append('coverLetter', coverLetter);
//             formData.append('resume', resume);

//             // Show loading message
//             document.getElementById('loading-message').style.display = 'block';

//             fetch(`http://localhost:3000/api/jobs/${jobId}/apply`, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}` },
//                 body: formData,
//             })
//                 .then(response => response.json())
//                 .then(data => {
//                     const messageElement = document.getElementById('response-message');
//                     const messageText = document.getElementById('message-text');

//                     if (data.success) {
//                         messageText.textContent = 'Application submitted successfully!';
//                         messageElement.style.display = 'block';
//                         document.getElementById('application-form').reset(); // Clear form
//                         setTimeout(() => { messageElement.style.display = 'none'; }, 5000);
//                     } else {
//                         messageText.textContent = data.message || 'Failed to submit application.';
//                         messageElement.style.display = 'block';
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Error:', error);
//                     document.getElementById('response-message').style.display = 'block';
//                     document.getElementById('message-text').textContent = 'An error occurred, please try again.';
//                 })
//                 .finally(() => {
//                     document.getElementById('loading-message').style.display = 'none'; // Hide loading message
//                 });
//         });
//     }

//     // Check if user was redirected after login and send them back to job page
//     const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
//     if (redirectAfterLogin) {
//         localStorage.removeItem('redirectAfterLogin'); // Clear stored redirect
//         window.location.href = redirectAfterLogin; // Redirect back to job details page
//     }
// });

document.addEventListener("DOMContentLoaded", function () {
  // **Handle Registration**
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    console.log("Register form found. Adding event listener.");
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();
      const role = document.getElementById("role").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const response = await fetch(`${baseURL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();
        if (data.success) {
          alert("Registration successful! Please log in.");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Registration failed.");
        }
      } catch (error) {
        console.error("Registration error:", error);
      }
    });
  } else {
    console.log('Register form element not found!');
  }

  // **Handle Login**
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    console.log("Login form found. Adding event listener.");
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const response = await fetch(`${baseURL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem("token", data.token); // Store JWT
          alert("Login successful!");
          window.location.href = "profile.html";
        } else {
          alert(data.message || "Login failed.");
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    });
  } else {
    console.log('Login form element not found!');
  }
});

// **4. Fetch and Display Profile Data**
document.addEventListener("DOMContentLoaded", async function () {
  if (window.location.pathname.endsWith("profile.html")) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You need to log in first.");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        document.getElementById("profileName").textContent = data.user.name;
        document.getElementById("profileEmail").textContent = data.user.email;
        document.getElementById("profileRole").textContent = data.user.role;
      } else {
        alert(data.message || "Failed to fetch profile data.");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  }
});

// **5. Handle Profile Update**
document.getElementById("updateProfileForm")?.addEventListener("submit", async function (event) {
  event.preventDefault();

  const token = localStorage.getItem("token");
  const name = document.getElementById("update-name").value.trim();
  const email = document.getElementById("update-email").value.trim();
  const password = document.getElementById("update-password").value.trim();

  if (!token) {
    alert("You need to log in first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${baseURL}/api/profile/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Profile updated successfully!");
      window.location.reload();
    } else {
      alert(data.message || "Profile update failed.");
    }
  } catch (error) {
    console.error("Profile update error:", error);
  }
});

// **6. Handle Account Deletion**
document.getElementById("deleteAccount")?.addEventListener("click", async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You need to log in first.");
    window.location.href = "login.html";
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${baseURL}/api/profile/delete-account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      alert("Account deleted successfully.");
      localStorage.removeItem("token");
      window.location.href = "register.html";
    } else {
      alert(data.message || "Account deletion failed.");
    }
  } catch (error) {
    console.error("Account deletion error:", error);
  }
});

// post job
// document.addEventListener('DOMContentLoaded', function() {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     // If no token is found, redirect to login
//     window.location.href = 'login.html';
//   } else {
//     // Decode the token to get user information (you can use a library like 'jwt-decode')
//     const decodedToken = jwt_decode(token);
    
//     // Check if the role is 'employer'
//     if (decodedToken.role !== 'employer') {
//       // If the user is not an employer, redirect to another page (e.g., job search)
//       window.location.href = 'job-search.html';
//     }
//   }
// });
