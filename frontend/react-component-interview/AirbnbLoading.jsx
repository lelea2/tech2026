import React, { useEffect, useRef, useState } from "react";

const LIMIT = 8;

export default function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    async function fetchProducts() {
      if (loadingRef.current || !hasMore) return;

      loadingRef.current = true;
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `https://fakestoreapi.com/products?limit=${LIMIT}&page=${page}`
        );

        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        const data = await res.json();

        setProducts((prev) => [...prev, ...data]);

        if (data.length < LIMIT) {
          setHasMore(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page, hasMore]);

  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <main className="page">
      <h1>Airbnb Style Products</h1>

      <section className="grid">
        {products.map((product) => (
          <article className="card" key={product.id}>
            <div className="imageBox">
              <img src={product.image} alt={product.title} />
            </div>

            <h2>{product.title}</h2>
            <p>
              {product.description.length > 100
                ? product.description.slice(0, 100) + "..."
                : product.description}
            </p>
          </article>
        ))}
      </section>

      {loading && <div className="status">Loading...</div>}
      {error && <div className="status error">{error}</div>}
      {!hasMore && <div className="status">No more products</div>}

      <div ref={bottomRef} className="bottom" />
    </main>
  );
}