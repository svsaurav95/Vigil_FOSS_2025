const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
  return (
    <section style={{
      
      background: "linear-gradient(to right, #102653, rgb(14, 18, 28), #000000)",
    }}>
        <h3 style={{
        width: "40%",
        marginLeft: "400px",
        marginRight: "-20px"
      }}>
        Made with Passion ✊ by <span style={{color: "rgb(200, 163, 50)"}}>Team Digi Dynamos</span></h3>
        <button
        onClick={scrollToTop}
        style={{
          display: "block",
          margin: "20px auto",
          marginTop: "50px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor:"rgb(82, 147, 253)",
          color: "black",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "background-color 0.3s, transform 0.3s",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "rgb(7, 79, 196)";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "rgb(82, 147, 253)";
          e.target.style.transform = "scale(1)";
        }}
      >
        Return to Top
      </button>
    </section>
    
  );
};

export default Footer;
