import Nav from "./nav";

export default function Layout({ user, children }) {
  return (
    <>
      <Nav user={user} />
      <main>
        <div className="container">{children}</div>
      </main>

      <style jsx>
        {`
          .container {
            margin: 0 auto;
            width: 700px;
          }
          main {
            margin: 0 auto;
            width: 800px;
          }
        `}
      </style>
    </>
  );
}