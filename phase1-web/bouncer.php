<?php
/*  
  ============================================================
  File: bouncer.php
  Project: Travel Experts – Workshop 1
  Author: Cantor Zapalski
  Partner: Metacoda (ChatGPT)
  Date: 2025-10-27
  Description:
    Simple PHP endpoint that receives registration form data 
    from register.html.  
    Logs the POST payload to the server console (error_log) 
    and returns a minimal HTTP response to confirm receipt.
  ============================================================
*/

/*  
  ------------------------------------------------------------
  Handle POST requests only.
  The form uses method="POST" — log its contents to terminal 
  or server log for testing.  
  No database writes or HTML output are performed.  
  ------------------------------------------------------------
*/
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Write separator header in log for readability
    error_log("=== New Registration Submission ===");

    // Print entire POST array to PHP error log
    error_log(print_r($_POST, true));

    // Return HTTP 200 OK and short success message
    http_response_code(200);
    echo "OK";

} else {
    /*  
      Reject any non-POST request (e.g., GET access).  
      Return 405 Method Not Allowed for clarity.
    */
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
