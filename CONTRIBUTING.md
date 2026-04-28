# Contributing to Academic AI RAG Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Git
- Basic understanding of RAG, LangChain, and FastAPI

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/yourusername/academic-ai-rag.git
cd academic-ai-rag

# Install dependencies
pip install -r backend/requirements.txt

# Install development dependencies
pip install pytest pytest-cov black flake8 mypy

# Run tests
pytest tests/ -v
```

## 📝 Code Style

### Python
- Follow PEP 8 style guide
- Use type hints where applicable
- Maximum line length: 100 characters
- Use meaningful variable and function names

### Formatting
```bash
# Format code with black
black backend/

# Check linting
flake8 backend/

# Type checking
mypy backend/
```

### Documentation
- Add docstrings to all functions and classes
- Use Google-style docstrings
- Update README.md for new features

## 🧪 Testing

### Writing Tests
- Write tests for all new features
- Maintain test coverage above 80%
- Use pytest fixtures for setup/teardown
- Test both success and failure cases

### Running Tests
```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=backend --cov-report=html

# Run specific test file
pytest tests/test_agents.py -v
```

## 🔄 Pull Request Process

### Before Submitting
1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   ```bash
   pytest tests/ -v
   black backend/
   flake8 backend/
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format
Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding tests
- `refactor:` Code refactoring
- `style:` Code style changes
- `chore:` Maintenance tasks

### Submitting PR
1. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create Pull Request on GitHub
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes

3. Wait for review
   - Address reviewer comments
   - Keep PR updated with main branch

## 🐛 Reporting Bugs

### Before Reporting
- Check existing issues
- Verify bug in latest version
- Collect relevant information

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 11]
- Python version: [e.g., 3.11.5]
- Browser: [e.g., Chrome 120]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Suggesting Features
1. Check if feature already requested
2. Provide clear use case
3. Explain expected behavior
4. Consider implementation approach

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Any other relevant information
```

## 📚 Documentation

### What to Document
- New features and APIs
- Configuration options
- Architecture changes
- Breaking changes

### Where to Document
- **README.md**: Overview and quick start
- **ARCHITECTURE.md**: Technical details
- **Code comments**: Implementation details
- **Docstrings**: Function/class documentation

## 🏗️ Project Structure

```
academic-ai-rag/
├── backend/           # Backend application
│   ├── agents/       # Multi-agent system
│   ├── rag/          # RAG pipeline
│   ├── routes/       # API endpoints
│   ├── models/       # Database models
│   └── db/           # Database setup
├── js/               # Frontend JavaScript
├── css/              # Frontend styles
├── tests/            # Test suite
└── docs/             # Additional documentation
```

## 🤝 Code Review Guidelines

### For Reviewers
- Be constructive and respectful
- Focus on code quality and maintainability
- Check for test coverage
- Verify documentation updates

### For Contributors
- Respond to feedback promptly
- Ask questions if unclear
- Be open to suggestions
- Keep discussions professional

## 📋 Checklist

Before submitting PR, ensure:
- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] PR description is clear

## 🎯 Areas for Contribution

### High Priority
- Additional test coverage
- Performance optimizations
- Documentation improvements
- Bug fixes

### Medium Priority
- New agent types
- UI enhancements
- Additional file format support
- Caching improvements

### Low Priority
- Code refactoring
- Style improvements
- Minor feature additions

## 📞 Getting Help

- **GitHub Issues**: For bugs and features
- **Discussions**: For questions and ideas
- **Documentation**: Check ARCHITECTURE.md

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🚀**
